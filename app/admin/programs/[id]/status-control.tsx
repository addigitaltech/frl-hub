'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramStatus } from '@prisma/client';
import { setProgramStatus } from '@/lib/actions/programs';

const STATUSES: ProgramStatus[] = ['DRAFT', 'UPCOMING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];

export function ProgramStatusControl({ id, status }: { id: string; status: ProgramStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as ProgramStatus)}
        className="border border-line rounded-lg px-2 py-1.5 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() =>
          startTransition(async () => {
            await setProgramStatus(id, value);
            router.refresh();
          })
        }
        className="btn secondary text-sm"
      >
        {pending ? 'Updating…' : 'Update status'}
      </button>
    </div>
  );
}
