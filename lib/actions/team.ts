'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TeamMemberStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

async function nextFrlId(): Promise<string> {
  // Sequential, human-readable IDs (FRL-TEAM-0001, ...). Reads the
  // highest existing numeric suffix rather than counting rows, so gaps
  // left by a deleted member don't get reused.
  const last = await db.teamMember.findFirst({ orderBy: { frlId: 'desc' } });
  const lastNum = last ? parseInt(last.frlId.split('-').pop() || '0', 10) : 0;
  return `FRL-TEAM-${String(lastNum + 1).padStart(4, '0')}`;
}

const schema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(2).max(120),
  position: z.string().optional().default(''),
  department: z.string().optional().default(''),
  bio: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  skills: z.string().optional().default(''), // comma-separated in the form
  publicProfile: z.string().optional(), // checkbox: "on" | undefined
});

export type SaveTeamMemberState = { ok: boolean; error?: string; id?: string };

export async function saveTeamMember(_prev: SaveTeamMemberState, formData: FormData): Promise<SaveTeamMemberState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'team.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage team members.' };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;

  const skills = d.skills.split(',').map((s) => s.trim()).filter(Boolean);
  const data = {
    fullName: d.fullName,
    position: d.position || null,
    department: d.department || null,
    bio: d.bio || null,
    photoUrl: d.photoUrl || null,
    skills,
    publicProfile: d.publicProfile === 'on',
  };

  try {
    if (d.id) {
      const updated = await db.teamMember.update({ where: { id: d.id }, data });
      await db.auditLog.create({ data: { actorId: session.user.id, action: 'team.update', entityType: 'TeamMember', entityId: updated.id } });
      revalidatePath('/admin/team');
      revalidatePath('/team');
      revalidatePath(`/verify/team/${updated.frlId}`);
      return { ok: true, id: updated.id };
    }

    const frlId = await nextFrlId();
    const created = await db.teamMember.create({ data: { ...data, frlId, status: TeamMemberStatus.PENDING } });
    await db.auditLog.create({ data: { actorId: session.user.id, action: 'team.create', entityType: 'TeamMember', entityId: created.id, metadata: { frlId } } });
    revalidatePath('/admin/team');
    return { ok: true, id: created.id };
  } catch (err) {
    console.error('[saveTeamMember]', err);
    return { ok: false, error: 'Could not save the team member.' };
  }
}

export async function setTeamMemberStatus(id: string, status: TeamMemberStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'team.manage');

  const member = await db.teamMember.update({ where: { id }, data: { status } });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: 'team.setStatus', entityType: 'TeamMember', entityId: id, metadata: { status } },
  });
  // Verification pages read live from the DB on every request, so a
  // status change (e.g. SUSPENDED) is reflected immediately without
  // needing to touch the printed QR code or card.
  revalidatePath('/admin/team');
  revalidatePath(`/admin/team/${id}`);
  revalidatePath('/team');
  revalidatePath(`/verify/team/${member.frlId}`);
}
