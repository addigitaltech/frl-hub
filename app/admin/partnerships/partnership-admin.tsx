'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PartnerApplicationStatus } from '@prisma/client';
import { setPartnerApplicationStatus } from '@/lib/actions/partnerships';

type P = {
  id: string; organisation: string; contactPerson: string; email: string;
  organisationType: string | null; participantCount: number | null;
  status: PartnerApplicationStatus; createdAt: Date; message: string | null;
};

const STATUSES: PartnerApplicationStatus[] = ['NEW', 'REVIEWING', 'CONTACTED', 'APPROVED', 'REJECTED', 'COMPLETED'];

export function PartnershipAdmin({ items }: { items: P[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted">No partner applications yet.</p>}
      {items.map((p) => (
        <div key={p.id} className="bg-white border border-line rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{p.organisation}</p>
              <p className="text-xs text-muted">{p.contactPerson} · {p.email} · {p.organisationType || 'Type not specified'}{p.participantCount ? ` · ~${p.participantCount} participants` : ''}</p>
              {p.message && <p className="text-sm mt-2">{p.message}</p>}
            </div>
            <select
              defaultValue={p.status}
              disabled={pending}
              onChange={(ev) => startTransition(async () => { await setPartnerApplicationStatus(p.id, ev.target.value as PartnerApplicationStatus); router.refresh(); })}
              className="border border-line rounded-lg px-2 py-1 text-xs shrink-0"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
