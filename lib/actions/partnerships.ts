'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { PartnerApplicationStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const publicSchema = z.object({
  organisation: z.string().min(2),
  contactPerson: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  location: z.string().optional().default(''),
  organisationType: z.string().optional().default(''),
  participantCount: z.string().optional().default(''),
  interestedProgram: z.string().optional().default(''),
  preferredDate: z.string().optional().default(''),
  message: z.string().optional().default(''),
  website: z.string().max(0).optional(), // honeypot
});

export type SubmitState = { ok: boolean; error?: string };

export async function submitPartnerApplication(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const parsed = publicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return { ok: true };
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check your input.' };
  }
  const d = parsed.data;
  await db.partnerApplication.create({
    data: {
      organisation: d.organisation,
      contactPerson: d.contactPerson,
      email: d.email,
      phone: d.phone || null,
      location: d.location || null,
      organisationType: d.organisationType || null,
      participantCount: d.participantCount ? Number(d.participantCount) : null,
      interestedProgram: d.interestedProgram || null,
      preferredDate: d.preferredDate ? new Date(d.preferredDate) : null,
      message: d.message || null,
    },
  });
  revalidatePath('/admin/partnerships');
  return { ok: true };
}

export async function setPartnerApplicationStatus(id: string, status: PartnerApplicationStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'partnerships.manage');
  await db.partnerApplication.update({ where: { id }, data: { status } });
  revalidatePath('/admin/partnerships');
}
