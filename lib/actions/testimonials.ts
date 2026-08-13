'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { TestimonialStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  role: z.string().optional().default(''),
  organisation: z.string().optional().default(''),
  photoUrl: z.string().optional().default(''),
  quote: z.string().min(3),
  videoUrl: z.string().optional().default(''),
  featured: z.string().optional(),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveTestimonial(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'testimonials.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage testimonials.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;
  const data = {
    name: d.name,
    role: d.role || null,
    organisation: d.organisation || null,
    photoUrl: d.photoUrl || null,
    quote: d.quote,
    videoUrl: d.videoUrl || null,
    featured: d.featured === 'on',
  };
  if (d.id) await db.testimonial.update({ where: { id: d.id }, data });
  else await db.testimonial.create({ data: { ...data, status: TestimonialStatus.PENDING } });
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
  return { ok: true };
}

export async function setTestimonialStatus(id: string, status: TestimonialStatus) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'testimonials.manage');
  await db.testimonial.update({ where: { id }, data: { status } });
  revalidatePath('/admin/testimonials');
  revalidatePath('/');
}
