'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  whatsappNumber: z.string().optional().default(''),
  whatsappDefaultMsg: z.string().optional().default(''),
  whatsappEnabled: z.string().optional(),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveWhatsappSettings(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'whatsapp.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage WhatsApp settings.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'Invalid input.' };
  const d = parsed.data;

  await db.settings.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      whatsappNumber: d.whatsappNumber || null,
      whatsappDefaultMsg: d.whatsappDefaultMsg || null,
      whatsappEnabled: d.whatsappEnabled === 'on',
    },
    update: {
      whatsappNumber: d.whatsappNumber || null,
      whatsappDefaultMsg: d.whatsappDefaultMsg || null,
      whatsappEnabled: d.whatsappEnabled === 'on',
    },
  });
  revalidatePath('/', 'layout');
  revalidatePath('/admin/settings/whatsapp');
  return { ok: true };
}
