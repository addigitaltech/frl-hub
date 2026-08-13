'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ResourceStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import slugify from 'slugify';

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional().default(''),
  category: z.string().optional().default(''),
  fileUrl: z.string().min(1, 'File URL is required'),
  thumbnailUrl: z.string().optional().default(''),
  author: z.string().optional().default(''),
  tags: z.string().optional().default(''),
  status: z.nativeEnum(ResourceStatus).default(ResourceStatus.DRAFT),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveResource(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'resources.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage resources.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;
  const tags = d.tags.split(',').map((s) => s.trim()).filter(Boolean);
  const data = {
    title: d.title,
    description: d.description || null,
    category: d.category || null,
    fileUrl: d.fileUrl,
    thumbnailUrl: d.thumbnailUrl || null,
    author: d.author || null,
    tags,
    status: d.status,
  };

  if (d.id) {
    await db.resource.update({ where: { id: d.id }, data });
  } else {
    const slug = slugify(d.title, { lower: true, strict: true }) + '-' + Date.now().toString(36).slice(-4);
    await db.resource.create({ data: { ...data, slug } });
  }
  revalidatePath('/admin/resources');
  revalidatePath('/resources');
  return { ok: true };
}

export async function deleteResource(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'resources.manage');
  await db.resource.delete({ where: { id } });
  revalidatePath('/admin/resources');
  revalidatePath('/resources');
}

export async function incrementDownloadCount(id: string) {
  await db.resource.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch((err) => {
    console.error('[incrementDownloadCount]', err);
  });
}
