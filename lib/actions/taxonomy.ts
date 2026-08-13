'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import slugify from 'slugify';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

export async function createCategory(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'journal.create');

  const slug = slugify(name, { lower: true, strict: true });
  await db.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  revalidatePath('/admin/journal');
  revalidatePath('/admin/journal/taxonomy');
}

export async function createTag(name: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'journal.create');

  const slug = slugify(name, { lower: true, strict: true });
  await db.tag.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });
  revalidatePath('/admin/journal');
  revalidatePath('/admin/journal/taxonomy');
}
