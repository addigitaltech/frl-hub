'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ProgramStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import { uniqueProgramSlug } from '@/lib/slug';

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(3).max(160),
  description: z.string().optional().default(''),
  objectives: z.string().optional().default(''),
  targetAudience: z.string().optional().default(''),
  featuredImageUrl: z.string().optional().default(''),
  registrationUrl: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  seoTitle: z.string().optional().default(''),
  seoDescription: z.string().optional().default(''),
});

export type SaveProgramState = { ok: boolean; error?: string; id?: string };

export async function saveProgram(_prev: SaveProgramState, formData: FormData): Promise<SaveProgramState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'programs.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage programs.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;

  const data = {
    name: d.name,
    description: d.description || null,
    objectives: d.objectives || null,
    targetAudience: d.targetAudience || null,
    featuredImageUrl: d.featuredImageUrl || null,
    registrationUrl: d.registrationUrl || null,
    startDate: d.startDate ? new Date(d.startDate) : null,
    endDate: d.endDate ? new Date(d.endDate) : null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };

  try {
    if (d.id) {
      const existing = await db.program.findUnique({ where: { id: d.id } });
      if (!existing) return { ok: false, error: 'Program not found.' };
      const slug = existing.name === d.name ? existing.slug : await uniqueProgramSlug(d.name, existing.id);
      const updated = await db.program.update({ where: { id: d.id }, data: { ...data, slug } });
      await db.auditLog.create({ data: { actorId: session.user.id, action: 'programs.update', entityType: 'Program', entityId: updated.id } });
      revalidatePath('/admin/programs');
      revalidatePath('/programs');
      return { ok: true, id: updated.id };
    }

    const slug = await uniqueProgramSlug(d.name);
    const created = await db.program.create({ data: { ...data, slug, status: ProgramStatus.DRAFT } });
    await db.auditLog.create({ data: { actorId: session.user.id, action: 'programs.create', entityType: 'Program', entityId: created.id } });
    revalidatePath('/admin/programs');
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('[saveProgram]', err);
    return { ok: false, error: 'Could not save the program.' };
  }
}

export async function setProgramStatus(id: string, status: ProgramStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'programs.manage');

  await db.program.update({ where: { id }, data: { status } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: 'programs.setStatus', entityType: 'Program', entityId: id, metadata: { status } },
  });
  revalidatePath('/admin/programs');
  revalidatePath(`/admin/programs/${id}`);
  revalidatePath('/programs');
}
