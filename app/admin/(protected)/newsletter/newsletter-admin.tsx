'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignStatus } from '@prisma/client';
import { saveCampaign, markCampaignSent } from '@/lib/actions/newsletter';

type C = { id: string; subject: string; contentHtml: string; status: CampaignStatus; recipientCount: number; sentAt: Date | null };

export function NewsletterAdmin({ campaigns, confirmedCount }: { campaigns: C[]; confirmedCount: number }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-xl">
        <div className="rounded-2xl bg-ink text-white p-5">
          <b className="text-3xl block">{confirmedCount}</b>
          <span className="text-[#b8d2c3] text-xs">Confirmed subscribers</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-900 mb-4 max-w-xl">
        No email provider is configured yet (see EMAIL_PROVIDER_API_KEY in .env.example). Confirm/welcome
        emails and campaign sends are recorded in the database but not actually delivered until one is wired up.
      </div>

      <button className="btn secondary mb-4" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ New campaign'}
      </button>

      {showForm && (
        <form
          action={(fd) => startTransition(async () => { await saveCampaign(fd); setShowForm(false); router.refresh(); })}
          className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-xl space-y-3"
        >
          <div className="field"><label>Subject</label><input name="subject" required /></div>
          <div className="field"><label>Content (HTML)</label><textarea name="contentHtml" rows={6} required /></div>
          <button type="submit" disabled={pending} className="btn primary text-sm">{pending ? 'Saving…' : 'Save draft'}</button>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden max-w-xl">
        {campaigns.length === 0 && <p className="p-4 text-sm text-muted">No campaigns yet.</p>}
        {campaigns.map((c) => (
          <div key={c.id} className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{c.subject}</p>
              <p className="text-xs text-muted">{c.status}{c.sentAt ? ` · sent to ${c.recipientCount} on ${new Date(c.sentAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}` : ''}</p>
            </div>
            {c.status !== 'SENT' && (
              <button
                className="btn secondary text-xs"
                disabled={pending}
                onClick={() => { if (window.confirm('Mark this campaign as sent? (No email provider is wired up — this records intent only.)')) startTransition(async () => { await markCampaignSent(c.id); router.refresh(); }); }}
              >
                Mark sent
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
