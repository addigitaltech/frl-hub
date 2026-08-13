'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  number: z.string(),
  suffix: z.string().optional().default('+'),
  description: z.string().optional().default(''),
  order: z.string().optional().default('0'),
  visible: z.string().optional(),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveImpactMetric(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'impact.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage impact metrics.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;
  const data = {
    label: d.label,
    number: Number(d.number) || 0,
    suffix: d.suffix || '+',
    description: d.description || null,
    order: Number(d.order) || 0,
    visible: d.visible === 'on',
  };
  if (d.id) await db.impactMetric.update({ where: { id: d.id }, data });
  else await db.impactMetric.create({ data });
  revalidatePath('/admin/impact');
  revalidatePath('/');
  return { ok: true };
}

export async function deleteImpactMetric(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'impact.manage');
  await db.impactMetric.delete({ where: { id } });
  revalidatePath('/admin/impact');
  revalidatePath('/');
}
