'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { OpportunityStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  provider: z.string().optional().default(''),
  description: z.string().optional().default(''),
  eligibility: z.string().optional().default(''),
  deadline: z.string().optional().default(''),
  location: z.string().optional().default(''),
  isOnline: z.string().optional(),
  applicationUrl: z.string().optional().default(''),
  category: z.string().optional().default(''),
  featured: z.string().optional(),
  status: z.nativeEnum(OpportunityStatus).default(OpportunityStatus.DRAFT),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveOpportunity(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'opportunities.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage opportunities.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;
  const data = {
    title: d.title,
    provider: d.provider || null,
    description: d.description || null,
    eligibility: d.eligibility || null,
    deadline: d.deadline ? new Date(d.deadline) : null,
    location: d.location || null,
    isOnline: d.isOnline === 'on',
    applicationUrl: d.applicationUrl || null,
    category: d.category || null,
    featured: d.featured === 'on',
    status: d.status,
  };
  if (d.id) await db.opportunity.update({ where: { id: d.id }, data });
  else await db.opportunity.create({ data });
  revalidatePath('/admin/opportunities');
  revalidatePath('/opportunities');
  return { ok: true };
}

export async function deleteOpportunity(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'opportunities.manage');
  await db.opportunity.delete({ where: { id } });
  revalidatePath('/admin/opportunities');
  revalidatePath('/opportunities');
}

// Called by the scheduled-publish cron alongside articles — see
// app/api/cron/publish-scheduled. Marks past-deadline opportunities
// ARCHIVED so the public list doesn't show them, without deleting history.
export async function archiveExpiredOpportunities() {
  const result = await db.opportunity.updateMany({
    where: { status: OpportunityStatus.PUBLISHED, deadline: { lt: new Date() } },
    data: { status: OpportunityStatus.EXPIRED },
  });
  return result.count;
}
