import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ArticleStatus } from '@prisma/client';

// Wire this up with an external scheduler (Vercel Cron, a cron job hitting
// this URL, etc.) — e.g. every 5 minutes. It is intentionally NOT protected
// by admin session auth (a cron runner has no browser session); instead it
// checks a shared secret header, matching CRON_SECRET in the environment.
//
// Per spec section 9: "If a scheduled job fails: record failure, retry
// where safe, notify administrator, log the error. Do not silently fail."
// Every attempt — success or failure — is written to ScheduledJobLog. This
// route does not implement the "notify administrator" leg yet (that needs
// the transactional-email provider from a later phase); until then,
// failures are visible by querying ScheduledJobLog / the admin content
// calendar.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const due = await db.article.findMany({
    where: { status: ArticleStatus.SCHEDULED, publishAt: { lte: new Date() } },
  });

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const article of due) {
    try {
      await db.article.update({
        where: { id: article.id },
        data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
      });
      await db.scheduledJobLog.create({
        data: {
          jobName: 'publish-scheduled-articles',
          entityType: 'Article',
          entityId: article.id,
          success: true,
        },
      });
      results.push({ id: article.id, success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await db.scheduledJobLog.create({
        data: {
          jobName: 'publish-scheduled-articles',
          entityType: 'Article',
          entityId: article.id,
          success: false,
          error: message,
        },
      });
      results.push({ id: article.id, success: false, error: message });
      // Continue to the next article — one failure should not block the
      // rest of the batch ("retry where safe": this job is idempotent
      // per-article, so simply running again on the next tick is the retry).
    }
  }

  return NextResponse.json({ checked: due.length, results });
}
