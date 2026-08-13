'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TeamApplicationStatus, TeamMemberStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const publicSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  roleAppliedFor: z.string().optional().default(''),
  coverMessage: z.string().optional().default(''),
  resumeUrl: z.string().optional().default(''),
  website: z.string().max(0).optional(), // honeypot
});

export type SubmitState = { ok: boolean; error?: string };

export async function submitTeamApplication(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const parsed = publicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return { ok: true };
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check your input.' };
  }
  const d = parsed.data;
  await db.teamApplication.create({
    data: {
      fullName: d.fullName,
      email: d.email,
      phone: d.phone || null,
      roleAppliedFor: d.roleAppliedFor || null,
      coverMessage: d.coverMessage || null,
      resumeUrl: d.resumeUrl || null,
    },
  });
  revalidatePath('/admin/team-applications');
  return { ok: true };
}

export async function setTeamApplicationStatus(id: string, status: TeamApplicationStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'team_applications.manage');
  await db.teamApplication.update({ where: { id }, data: { status } });
  revalidatePath('/admin/team-applications');
}

// Spec section 18: "Admin can... Add approved applicant to team." This is
// the one explicit bridge from an application into a real TeamMember —
// deliberately manual, not automatic, so approving an application never
// silently publishes someone before an admin reviews and confirms.
export async function promoteApplicationToTeamMember(applicationId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'team.manage');

  const app = await db.teamApplication.findUnique({ where: { id: applicationId } });
  if (!app) throw new Error('Application not found.');
  if (app.status !== 'APPROVED') throw new Error('Only approved applications can be added to the team.');

  const last = await db.teamMember.findFirst({ orderBy: { frlId: 'desc' } });
  const lastNum = last ? parseInt(last.frlId.split('-').pop() || '0', 10) : 0;
  const frlId = `FRL-TEAM-${String(lastNum + 1).padStart(4, '0')}`;

  const member = await db.teamMember.create({
    data: {
      frlId,
      fullName: app.fullName,
      position: app.roleAppliedFor,
      status: TeamMemberStatus.PENDING,
    },
  });

  revalidatePath('/admin/team');
  revalidatePath('/admin/team-applications');
  return member.id;
}
