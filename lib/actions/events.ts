'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EventStatus, EventMode } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import { uniqueEventSlug } from '@/lib/slug';

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  description: z.string().optional().default(''),
  location: z.string().optional().default(''),
  mode: z.nativeEnum(EventMode).default(EventMode.OFFLINE),
  capacity: z.string().optional().default(''),
  startTime: z.string().optional().default(''),
  endTime: z.string().optional().default(''),
  registrationDeadline: z.string().optional().default(''),
  registrationUrl: z.string().optional().default(''),
  featuredImageUrl: z.string().optional().default(''),
  programId: z.string().optional().default(''),
});

export type SaveEventState = { ok: boolean; error?: string; id?: string };

export async function saveEvent(_prev: SaveEventState, formData: FormData): Promise<SaveEventState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'events.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage events.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;

  const data = {
    title: d.title,
    description: d.description || null,
    location: d.location || null,
    mode: d.mode,
    capacity: d.capacity ? Number(d.capacity) : null,
    startTime: d.startTime ? new Date(d.startTime) : null,
    endTime: d.endTime ? new Date(d.endTime) : null,
    registrationDeadline: d.registrationDeadline ? new Date(d.registrationDeadline) : null,
    registrationUrl: d.registrationUrl || null,
    featuredImageUrl: d.featuredImageUrl || null,
    programId: d.programId || null,
  };

  try {
    if (d.id) {
      const existing = await db.event.findUnique({ where: { id: d.id } });
      if (!existing) return { ok: false, error: 'Event not found.' };
      const slug = existing.title === d.title ? existing.slug : await uniqueEventSlug(d.title, existing.id);
      const updated = await db.event.update({ where: { id: d.id }, data: { ...data, slug } });
      await db.auditLog.create({ data: { actorId: session.user.id, action: 'events.update', entityType: 'Event', entityId: updated.id } });
      revalidatePath('/admin/events');
      revalidatePath('/events');
      return { ok: true, id: updated.id };
    }

    const slug = await uniqueEventSlug(d.title);
    const created = await db.event.create({ data: { ...data, slug, status: EventStatus.DRAFT } });
    await db.auditLog.create({ data: { actorId: session.user.id, action: 'events.create', entityType: 'Event', entityId: created.id } });
    revalidatePath('/admin/events');
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('[saveEvent]', err);
    return { ok: false, error: 'Could not save the event.' };
  }
}

export async function setEventStatus(id: string, status: EventStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'events.manage');

  await db.event.update({ where: { id }, data: { status } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: 'events.setStatus', entityType: 'Event', entityId: id, metadata: { status } },
  });
  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${id}`);
  revalidatePath('/events');
}
