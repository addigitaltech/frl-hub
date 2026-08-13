'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

// Seed the flags the spec explicitly calls for as toggleable modules.
// Calling this is idempotent (upsert), so it's safe to call from the
// admin page on every load rather than needing a separate seed step.
export async function ensureDefaultFlags() {
  const defaults = [
    { key: 'volunteers', label: 'Volunteer system', description: 'Public volunteer application + profile pages (spec section 19).' },
    { key: 'push_notifications', label: 'Push notifications', description: 'Web Push subscribe/notify pipeline (spec section 24).' },
    { key: 'comments', label: 'Journal comments', description: 'Public comments on FRL Journal articles.' },
  ];
  for (const f of defaults) {
    await db.featureFlag.upsert({ where: { key: f.key }, update: {}, create: { ...f, enabled: false } });
  }
}

export async function setFeatureFlag(key: string, enabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'feature_flags.manage');
  await db.featureFlag.update({ where: { key }, data: { enabled } });
  revalidatePath('/admin/feature-flags');
}
