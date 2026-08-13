'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

const brandingSchema = z.object({
  orgName: z.string().min(1).max(120),
  tagline: z.string().max(280).optional().default(''),
  colorPrimary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorSecondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  colorAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  defaultTimezone: z.string().min(1),
  homepageAnnouncement: z.string().max(280).optional().default(''),
});

// NOTE on storage: this saves uploaded logo files to /public/uploads,
// which is fine for local/dev and single-instance deploys but will NOT
// persist across most serverless deploys (e.g. Vercel's filesystem is
// ephemeral). Before production launch, swap `saveUpload` below for a
// call to an S3-compatible object storage provider — the rest of this
// action (validation, DB write, audit log) does not need to change.
async function saveUpload(file: File, slot: string): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'png';
  const filename = `${slot}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', 'branding');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/branding/${filename}`;
}

export type BrandingFormState = { ok: boolean; error?: string };

export async function updateBranding(
  _prev: BrandingFormState,
  formData: FormData
): Promise<BrandingFormState> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: 'Not signed in.' };

  try {
    requirePermission(session.user.role, 'settings.branding.manage');
  } catch {
    return { ok: false, error: 'You do not have permission to change branding.' };
  }

  const parsed = brandingSchema.safeParse({
    orgName: formData.get('orgName'),
    tagline: formData.get('tagline'),
    colorPrimary: formData.get('colorPrimary'),
    colorSecondary: formData.get('colorSecondary'),
    colorAccent: formData.get('colorAccent'),
    defaultTimezone: formData.get('defaultTimezone'),
    homepageAnnouncement: formData.get('homepageAnnouncement'),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const data: Record<string, unknown> = { ...parsed.data, updatedById: session.user.id };

  const logoFile = formData.get('logoPrimary') as File | null;
  if (logoFile && logoFile.size > 0) {
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(logoFile.type)) {
      return { ok: false, error: 'Logo must be PNG, JPEG, WebP, or SVG.' };
    }
    if (logoFile.size > 5 * 1024 * 1024) {
      return { ok: false, error: 'Logo must be under 5MB.' };
    }
    data.logoPrimaryUrl = await saveUpload(logoFile, 'primary');
  }

  const faviconFile = formData.get('favicon') as File | null;
  if (faviconFile && faviconFile.size > 0) {
    data.faviconUrl = await saveUpload(faviconFile, 'favicon');
  }

  await db.settings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...data },
    update: data,
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'settings.branding.update',
      entityType: 'Settings',
      entityId: 'default',
      metadata: { changedFields: Object.keys(data) },
    },
  });

  // Every reader of branding (public layout, admin shell) revalidates —
  // this is what makes "change the logo once, it updates everywhere" true.
  revalidatePath('/', 'layout');
  revalidatePath('/admin', 'layout');

  return { ok: true };
}
