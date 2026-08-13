'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityStatus } from '@prisma/client';
import { setActivityStatus } from '@/lib/actions/activities';

const STATUSES: ActivityStatus[] = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'COMPLETED', 'ARCHIVED'];

export function ActivityStatusControl({ id, status }: { id: string; status: ActivityStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={(e) => setValue(e.target.value as ActivityStatus)} className="border border-line rounded-lg px-2 py-1.5 text-sm">
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() => startTransition(async () => { await setActivityStatus(id, value); router.refresh(); })}
        className="btn secondary text-sm"
      >
        {pending ? 'Updating…' : 'Update status'}
      </button>
    </div>
  );
}
