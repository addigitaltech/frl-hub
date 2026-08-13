'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ActivityStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import { uniqueActivitySlug } from '@/lib/slug';

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  description: z.string().optional().default(''),
  objectives: z.string().optional().default(''),
  outcomes: z.string().optional().default(''),
  date: z.string().optional().default(''),
  location: z.string().optional().default(''),
  featuredImageUrl: z.string().optional().default(''),
  programId: z.string().optional().default(''),
});

export type SaveActivityState = { ok: boolean; error?: string; id?: string };

export async function saveActivity(_prev: SaveActivityState, formData: FormData): Promise<SaveActivityState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'activities.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage activities.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;

  const data = {
    title: d.title,
    description: d.description || null,
    objectives: d.objectives || null,
    outcomes: d.outcomes || null,
    date: d.date ? new Date(d.date) : null,
    location: d.location || null,
    featuredImageUrl: d.featuredImageUrl || null,
    programId: d.programId || null,
  };

  try {
    if (d.id) {
      const existing = await db.activity.findUnique({ where: { id: d.id } });
      if (!existing) return { ok: false, error: 'Activity not found.' };
      const slug = existing.title === d.title ? existing.slug : await uniqueActivitySlug(d.title, existing.id);
      const updated = await db.activity.update({ where: { id: d.id }, data: { ...data, slug } });
      await db.auditLog.create({ data: { actorId: session.user.id, action: 'activities.update', entityType: 'Activity', entityId: updated.id } });
      revalidatePath('/admin/activities');
      revalidatePath('/activities');
      return { ok: true, id: updated.id };
    }

    const slug = await uniqueActivitySlug(d.title);
    const created = await db.activity.create({ data: { ...data, slug, status: ActivityStatus.DRAFT } });
    await db.auditLog.create({ data: { actorId: session.user.id, action: 'activities.create', entityType: 'Activity', entityId: created.id } });
    revalidatePath('/admin/activities');
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('[saveActivity]', err);
    return { ok: false, error: 'Could not save the activity.' };
  }
}

export async function setActivityStatus(id: string, status: ActivityStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'activities.manage');

  await db.activity.update({ where: { id }, data: { status } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: 'activities.setStatus', entityType: 'Activity', entityId: id, metadata: { status } },
  });
  revalidatePath('/admin/activities');
  revalidatePath(`/admin/activities/${id}`);
  revalidatePath('/activities');
}
