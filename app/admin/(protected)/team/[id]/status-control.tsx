'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TeamMemberStatus } from '@prisma/client';
import { setTeamMemberStatus } from '@/lib/actions/team';

const STATUSES: TeamMemberStatus[] = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'ARCHIVED'];

export function TeamStatusControl({ id, status }: { id: string; status: TeamMemberStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select value={value} onChange={(e) => setValue(e.target.value as TeamMemberStatus)} className="border border-line rounded-lg px-2 py-1.5 text-sm">
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() => startTransition(async () => { await setTeamMemberStatus(id, value); router.refresh(); })}
        className="btn secondary text-sm"
      >
        {pending ? 'Updating…' : 'Update status'}
      </button>
      {value === 'SUSPENDED' && (
        <span className="text-xs text-red-600">Verification will show suspended immediately.</span>
      )}
    </div>
  );
}
