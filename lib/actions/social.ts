'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { SocialPlatform } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const schema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  url: z.string().url(),
  enabled: z.string().optional(),
  order: z.string().optional().default('0'),
});

export type SaveState = { ok: boolean; error?: string };

export async function saveSocialLink(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };
  try {
    requirePermission(session.user.role, 'social.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to manage social links.' };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  const d = parsed.data;

  await db.socialLink.upsert({
    where: { platform: d.platform },
    update: { url: d.url, enabled: d.enabled === 'on', order: Number(d.order) || 0 },
    create: { platform: d.platform, url: d.url, enabled: d.enabled === 'on', order: Number(d.order) || 0 },
  });
  revalidatePath('/admin/settings/social');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteSocialLink(platform: SocialPlatform) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'social.manage');
  await db.socialLink.delete({ where: { platform } }).catch(() => {});
  revalidatePath('/admin/settings/social');
  revalidatePath('/', 'layout');
}
