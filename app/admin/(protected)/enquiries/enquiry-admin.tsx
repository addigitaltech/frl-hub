'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EnquiryStatus } from '@prisma/client';
import { setEnquiryStatus, assignEnquiry } from '@/lib/actions/enquiries';

type E = {
  id: string; name: string; email: string; subject: string | null; message: string;
  status: EnquiryStatus; assignedToId: string | null; createdAt: Date;
};

export function EnquiryAdmin({ items, admins }: { items: E[]; admins: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted">No enquiries yet.</p>}
      {items.map((e) => (
        <div key={e.id} className="bg-white border border-line rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{e.name} <span className="text-muted font-normal">— {e.email}</span></p>
              <p className="text-xs text-muted">{e.subject || 'No subject'} · {new Date(e.createdAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}</p>
              <p className="text-sm mt-2">{e.message}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0 items-end">
              <select
                defaultValue={e.status}
                disabled={pending}
                onChange={(ev) => startTransition(async () => { await setEnquiryStatus(e.id, ev.target.value as EnquiryStatus); router.refresh(); })}
                className="border border-line rounded-lg px-2 py-1 text-xs"
              >
                {(['NEW', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'] as EnquiryStatus[]).map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <select
                defaultValue={e.assignedToId ?? ''}
                disabled={pending}
                onChange={(ev) => startTransition(async () => { await assignEnquiry(e.id, ev.target.value || null); router.refresh(); })}
                className="border border-line rounded-lg px-2 py-1 text-xs"
              >
                <option value="">Unassigned</option>
                {admins.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
