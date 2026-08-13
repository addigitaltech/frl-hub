'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  id: z.string().optional(),
  question: z.string().min(3),
  answer: z.string().min(3),
  category: z.string().optional().default(''),
  order: z.string().optional().default('0'),
  published: z.string().optional(),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveFaq(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'faq.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage the FAQ.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;
  const data = {
    question: d.question,
    answer: d.answer,
    category: d.category || null,
    order: Number(d.order) || 0,
    published: d.published === 'on',
  };

  if (d.id) {
    await db.faq.update({ where: { id: d.id }, data });
  } else {
    await db.faq.create({ data });
  }
  revalidatePath('/admin/faq');
  revalidatePath('/faq');
  return { ok: true };
}

export async function deleteFaq(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'faq.manage');
  await db.faq.delete({ where: { id } });
  revalidatePath('/admin/faq');
  revalidatePath('/faq');
}
