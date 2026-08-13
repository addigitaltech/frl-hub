import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ArticleForm } from '../article-form';
import { WorkflowActions } from './workflow-actions';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const [article, categories, tags] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
        author: { select: { name: true } },
        versions: { orderBy: { createdAt: 'desc' }, take: 5, include: { editedBy: { select: { name: true } } } },
      },
    }),
    db.category.findMany({ orderBy: { order: 'asc' } }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!article) notFound();

  const role = session.user.role;
  const canEdit = hasPermission(role, 'journal.edit.any') || (hasPermission(role, 'journal.edit.own') && article.authorId === session.user.id);

  const perms = {
    canSubmit: canEdit,
    canReview: hasPermission(role, 'journal.review'),
    canApprove: hasPermission(role, 'journal.approve'),
    canPublish: hasPermission(role, 'journal.publish'),
    canDelete: hasPermission(role, 'journal.delete'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">
            {article.status.replace('_', ' ')}
          </span>
          <h1 className="text-2xl font-extrabold mt-2">{article.title}</h1>
          <p className="text-xs text-muted mt-1">
            By {article.author?.name} · {article.readingTimeMinutes} min read
            {article.publishAt && ` · scheduled for ${new Date(article.publishAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} (Africa/Lagos)`}
          </p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl p-5 mb-6">
        <WorkflowActions articleId={article.id} status={article.status} perms={perms} />
      </div>

      {canEdit ? (
        <ArticleForm
          article={{
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            contentJson: article.contentJson,
            featuredImageUrl: article.featuredImageUrl,
            seoTitle: article.seoTitle,
            seoDescription: article.seoDescription,
            categories: article.categories,
            tags: article.tags,
          }}
          categories={categories}
          tags={tags}
        />
      ) : (
        <p className="text-sm text-muted">You can view this article's workflow status but do not have permission to edit its content.</p>
      )}

      {article.versions.length > 0 && (
        <div className="mt-8 bg-white border border-line rounded-2xl p-5 max-w-3xl">
          <h2 className="font-bold mb-2 text-sm">Recent versions</h2>
          <ul className="text-sm text-muted space-y-1">
            {article.versions.map((v) => (
              <li key={v.id}>
                {new Date(v.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })} — edited by {v.editedBy?.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
