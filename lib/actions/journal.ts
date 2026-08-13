'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ArticleStatus, Role } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission, requirePermission, ForbiddenError } from '@/lib/rbac';
import { uniqueArticleSlug } from '@/lib/slug';
import { estimateReadingTime } from '@/lib/reading-time';

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  return session;
}

function canEditArticle(role: Role, authorId: string, userId: string) {
  return hasPermission(role, 'journal.edit.any') || (hasPermission(role, 'journal.edit.own') && authorId === userId);
}

async function logAction(actorId: string, action: string, entityId: string, metadata?: Prisma.InputJsonValue) {
  await db.auditLog.create({
    data: { actorId, action, entityType: 'Article', entityId, metadata },
  });
}

// ---------------------------------------------------------------------------
// Create / save content
// ---------------------------------------------------------------------------

const saveSchema = z.object({
  articleId: z.string().optional(),
  title: z.string().min(3).max(200),
  excerpt: z.string().max(400).optional().default(''),
  contentJson: z.string(), // JSON-stringified Tiptap doc
  contentHtml: z.string(),
  featuredImageUrl: z.string().optional().default(''),
  seoTitle: z.string().max(70).optional().default(''),
  seoDescription: z.string().max(160).optional().default(''),
  categoryIds: z.array(z.string()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
});

export type SaveArticleState = { ok: boolean; error?: string; articleId?: string };

export async function saveArticle(_prev: SaveArticleState, formData: FormData): Promise<SaveArticleState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };

  const raw = {
    articleId: (formData.get('articleId') as string) || undefined,
    title: formData.get('title') as string,
    excerpt: formData.get('excerpt') as string,
    contentJson: formData.get('contentJson') as string,
    contentHtml: formData.get('contentHtml') as string,
    featuredImageUrl: formData.get('featuredImageUrl') as string,
    seoTitle: formData.get('seoTitle') as string,
    seoDescription: formData.get('seoDescription') as string,
    categoryIds: formData.getAll('categoryIds') as string[],
    tagIds: formData.getAll('tagIds') as string[],
  };

  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }
  const data = parsed.data;

  try {
    if (data.articleId) {
      const existing = await db.article.findUnique({ where: { id: data.articleId } });
      if (!existing) return { ok: false, error: 'Article not found.' };
      if (!canEditArticle(session.user.role, existing.authorId, session.user.id)) {
        return { ok: false, error: 'You do not have permission to edit this article.' };
      }

      const slug = existing.title === data.title ? existing.slug : await uniqueArticleSlug(data.title, existing.id);

      const updated = await db.article.update({
        where: { id: existing.id },
        data: {
          title: data.title,
          slug,
          excerpt: data.excerpt,
          contentJson: JSON.parse(data.contentJson),
          contentHtml: data.contentHtml,
          featuredImageUrl: data.featuredImageUrl || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          readingTimeMinutes: estimateReadingTime(data.contentHtml),
          categories: { set: data.categoryIds.map((id) => ({ id })) },
          tags: { set: data.tagIds.map((id) => ({ id })) },
        },
      });

      await db.articleVersion.create({
        data: {
          articleId: updated.id,
          title: updated.title,
          contentJson: updated.contentJson as never,
          contentHtml: updated.contentHtml,
          editedById: session.user.id,
        },
      });

      await logAction(session.user.id, 'journal.save', updated.id);
      revalidatePath(`/admin/journal/${updated.id}`);
      revalidatePath('/blog');
      return { ok: true, articleId: updated.id };
    }

    // New article
    try {
      requirePermission(session.user.role, 'journal.create');
    } catch (e) {
      if (e instanceof ForbiddenError) return { ok: false, error: 'You do not have permission to create articles.' };
      throw e;
    }

    const slug = await uniqueArticleSlug(data.title);
    const created = await db.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        contentJson: JSON.parse(data.contentJson),
        contentHtml: data.contentHtml,
        featuredImageUrl: data.featuredImageUrl || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        readingTimeMinutes: estimateReadingTime(data.contentHtml),
        authorId: session.user.id,
        status: ArticleStatus.DRAFT,
        categories: { connect: data.categoryIds.map((id) => ({ id })) },
        tags: { connect: data.tagIds.map((id) => ({ id })) },
      },
    });

    await db.articleVersion.create({
      data: {
        articleId: created.id,
        title: created.title,
        contentJson: created.contentJson as never,
        contentHtml: created.contentHtml,
        editedById: session.user.id,
      },
    });

    await logAction(session.user.id, 'journal.create', created.id);
    revalidatePath('/admin/journal');
    return { ok: true, articleId: created.id };
  } catch (err) {
    console.error('[saveArticle]', err);
    return { ok: false, error: 'Could not save the article. Check the server log for details.' };
  }
}

// ---------------------------------------------------------------------------
// Workflow transitions
// ---------------------------------------------------------------------------

const ALLOWED_TRANSITIONS: Record<string, ArticleStatus[]> = {
  submit: [ArticleStatus.DRAFT],
  requestChanges: [ArticleStatus.IN_REVIEW],
  approve: [ArticleStatus.IN_REVIEW],
  publishNow: [ArticleStatus.APPROVED, ArticleStatus.SCHEDULED],
  archive: [ArticleStatus.DRAFT, ArticleStatus.IN_REVIEW, ArticleStatus.APPROVED, ArticleStatus.SCHEDULED, ArticleStatus.PUBLISHED],
  trash: [ArticleStatus.DRAFT, ArticleStatus.IN_REVIEW, ArticleStatus.APPROVED, ArticleStatus.SCHEDULED, ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED],
  restore: [ArticleStatus.TRASHED, ArticleStatus.ARCHIVED],
};

type TransitionAction = keyof typeof ALLOWED_TRANSITIONS;

export async function transitionArticle(articleId: string, action: TransitionAction) {
  const session = await requireSession();
  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found.');

  if (!ALLOWED_TRANSITIONS[action].includes(article.status)) {
    throw new Error(`Cannot ${action} an article in status ${article.status}.`);
  }

  switch (action) {
    case 'submit':
      if (!canEditArticle(session.user.role, article.authorId, session.user.id)) {
        throw new Error('You do not have permission to submit this article.');
      }
      await db.article.update({ where: { id: articleId }, data: { status: ArticleStatus.IN_REVIEW } });
      break;

    case 'requestChanges':
      requirePermission(session.user.role, 'journal.review');
      await db.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.DRAFT, reviewedById: session.user.id },
      });
      break;

    case 'approve':
      requirePermission(session.user.role, 'journal.approve');
      await db.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.APPROVED, approvedById: session.user.id },
      });
      break;

    case 'publishNow':
      requirePermission(session.user.role, 'journal.publish');
      await db.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date(), publishAt: null },
      });
      break;

    case 'archive':
      requirePermission(session.user.role, 'journal.delete');
      await db.article.update({ where: { id: articleId }, data: { status: ArticleStatus.ARCHIVED, archivedAt: new Date() } });
      break;

    case 'trash':
      requirePermission(session.user.role, 'journal.delete');
      await db.article.update({ where: { id: articleId }, data: { status: ArticleStatus.TRASHED, trashedAt: new Date() } });
      break;

    case 'restore':
      requirePermission(session.user.role, 'journal.delete');
      await db.article.update({
        where: { id: articleId },
        data: { status: ArticleStatus.DRAFT, archivedAt: null, trashedAt: null },
      });
      break;
  }

  await logAction(session.user.id, `journal.${action}`, articleId, { fromStatus: article.status });
  revalidatePath('/admin/journal');
  revalidatePath(`/admin/journal/${articleId}`);
  revalidatePath('/blog');
}

export async function scheduleArticle(articleId: string, publishAtIso: string) {
  const session = await requireSession();
  requirePermission(session.user.role, 'journal.publish');

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found.');
  if (article.status !== ArticleStatus.APPROVED) {
    throw new Error('Only approved articles can be scheduled.');
  }

  const publishAt = new Date(publishAtIso);
  if (Number.isNaN(publishAt.getTime()) || publishAt.getTime() <= Date.now()) {
    throw new Error('Schedule time must be a valid time in the future.');
  }

  await db.article.update({
    where: { id: articleId },
    data: { status: ArticleStatus.SCHEDULED, publishAt },
  });

  await logAction(session.user.id, 'journal.schedule', articleId, { publishAt: publishAt.toISOString() });
  revalidatePath('/admin/journal');
  revalidatePath(`/admin/journal/${articleId}`);
}

// Trashed only, and restricted further to roles that can approve/publish
// (i.e. not a Content Editor cleaning up their own trash) — permanent
// deletion is destructive and should require the same authority as
// publishing, not just editing.
export async function permanentlyDeleteArticle(articleId: string) {
  const session = await requireSession();
  requirePermission(session.user.role, 'journal.delete');

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article not found.');
  if (article.status !== ArticleStatus.TRASHED) {
    throw new Error('Only trashed articles can be permanently deleted.');
  }

  await db.article.delete({ where: { id: articleId } });
  await logAction(session.user.id, 'journal.permanentlyDelete', articleId, { title: article.title });
  revalidatePath('/admin/journal');
}
