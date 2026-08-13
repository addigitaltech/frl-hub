'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { EventStatus } from '@prisma/client';
import { setEventStatus } from '@/lib/actions/events';

const STATUSES: EventStatus[] = ['DRAFT', 'UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED', 'CANCELLED', 'ARCHIVED'];

export function EventStatusControl({ id, status }: { id: string; status: EventStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={(e) => setValue(e.target.value as EventStatus)} className="border border-line rounded-lg px-2 py-1.5 text-sm">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() => startTransition(async () => { await setEventStatus(id, value); router.refresh(); })}
        className="btn secondary text-sm"
      >
        {pending ? 'Updating…' : 'Update status'}
      </button>
    </div>
  );
}
