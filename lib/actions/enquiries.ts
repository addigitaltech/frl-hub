'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { EnquiryStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const publicSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional().default(''),
  organisation: z.string().optional().default(''),
  subject: z.string().optional().default(''),
  message: z.string().min(5).max(4000),
  // Honeypot field: real users never fill this in; bots that
  // auto-fill every input do. Simple, dependency-free spam guard —
  // no CAPTCHA/provider wiring needed for a first line of defence.
  website: z.string().max(0).optional(),
});

export type SubmitState = { ok: boolean; error?: string };

export async function submitEnquiry(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const parsed = publicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    // Silently "succeed" for the honeypot case so a bot doesn't learn
    // its submission was rejected; real validation errors still surface.
    if (parsed.error.issues.some((i) => i.path[0] === 'website')) return { ok: true };
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Please check your input.' };
  }
  const d = parsed.data;

  await db.enquiry.create({
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone || null,
      organisation: d.organisation || null,
      subject: d.subject || null,
      message: d.message,
    },
  });
  revalidatePath('/admin/enquiries');
  return { ok: true };
}

export async function setEnquiryStatus(id: string, status: EnquiryStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'enquiries.manage');
  await db.enquiry.update({ where: { id }, data: { status } });
  revalidatePath('/admin/enquiries');
}

export async function assignEnquiry(id: string, assignedToId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'enquiries.manage');
  await db.enquiry.update({ where: { id }, data: { assignedToId } });
  revalidatePath('/admin/enquiries');
}
