'use server';

import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { CampaignStatus, SubscriberStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';

export type SubmitState = { ok: boolean; error?: string };

export async function subscribeToNewsletter(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const email = z.string().email().safeParse(formData.get('email'));
  if (!email.success) return { ok: false, error: 'Please enter a valid email address.' };

  const existing = await db.newsletterSubscriber.findUnique({ where: { email: email.data.toLowerCase() } });
  if (existing?.status === 'CONFIRMED') return { ok: true }; // already subscribed — treat as success
  if (existing) {
    // Re-issue a confirm link rather than erroring, in case the first email was lost.
    await db.newsletterSubscriber.update({ where: { id: existing.id }, data: { status: SubscriberStatus.PENDING } });
  } else {
    await db.newsletterSubscriber.create({ data: { email: email.data.toLowerCase() } });
  }

  // NOTE: no email provider is wired up yet (EMAIL_PROVIDER_API_KEY is
  // unset — see .env.example), so the confirm link isn't actually sent.
  // The subscriber row and confirm token exist and are correct; plugging
  // in a transactional email provider here (send to email.data with a
  // link to /newsletter/confirm/{confirmToken}) is the remaining step.
  return { ok: true };
}

export async function unsubscribeFromNewsletter(token: string) {
  await db.newsletterSubscriber.updateMany({
    where: { unsubscribeToken: token },
    data: { status: SubscriberStatus.UNSUBSCRIBED, unsubscribedAt: new Date() },
  });
}

export async function confirmNewsletterSubscription(token: string) {
  await db.newsletterSubscriber.updateMany({
    where: { confirmToken: token },
    data: { status: SubscriberStatus.CONFIRMED, confirmedAt: new Date() },
  });
}

const campaignSchema = z.object({
  id: z.string().optional(),
  subject: z.string().min(2),
  contentHtml: z.string().min(2),
});

export async function saveCampaign(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'newsletter.manage');

  const parsed = campaignSchema.parse(Object.fromEntries(formData));
  if (parsed.id) {
    await db.newsletterCampaign.update({ where: { id: parsed.id }, data: { subject: parsed.subject, contentHtml: parsed.contentHtml } });
  } else {
    await db.newsletterCampaign.create({ data: { subject: parsed.subject, contentHtml: parsed.contentHtml } });
  }
  revalidatePath('/admin/newsletter');
}

// Marks a campaign SENT and records the confirmed-subscriber count at
// send time. Does NOT actually deliver email — no provider is wired up.
// This is intentionally honest rather than a fake "sent successfully"
// with silent non-delivery: the audit log + recipientCount make clear
// what would have gone out once EMAIL_PROVIDER_API_KEY is configured.
export async function markCampaignSent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Not signed in.');
  requirePermission(session.user.role, 'newsletter.manage');

  const recipientCount = await db.newsletterSubscriber.count({ where: { status: 'CONFIRMED' } });
  await db.newsletterCampaign.update({
    where: { id },
    data: { status: CampaignStatus.SENT, sentAt: new Date(), recipientCount },
  });
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'newsletter.markSent',
      entityType: 'NewsletterCampaign',
      entityId: id,
      metadata: { recipientCount, note: 'No email provider wired up — this records intent, not delivery.' },
    },
  });
  revalidatePath('/admin/newsletter');
}
