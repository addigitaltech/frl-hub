'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { TeamApplicationStatus } from '@prisma/client';
import { setTeamApplicationStatus, promoteApplicationToTeamMember } from '@/lib/actions/team-applications';

type A = {
  id: string; fullName: string; email: string; roleAppliedFor: string | null;
  coverMessage: string | null; resumeUrl: string | null; status: TeamApplicationStatus; createdAt: Date;
};

const STATUSES: TeamApplicationStatus[] = ['NEW', 'REVIEWING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'];

export function TeamApplicationAdmin({ items, canManageTeam }: { items: A[]; canManageTeam: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [promoted, setPromoted] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted">No applications yet.</p>}
      {items.map((a) => (
        <div key={a.id} className="bg-white border border-line rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{a.fullName} <span className="text-muted font-normal">— {a.email}</span></p>
              <p className="text-xs text-muted">{a.roleAppliedFor || 'Role not specified'}</p>
              {a.coverMessage && <p className="text-sm mt-2">{a.coverMessage}</p>}
              {a.resumeUrl && <a href={a.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-frl-green-dark">View resume/CV →</a>}
            </div>
            <div className="flex flex-col gap-2 items-end shrink-0">
              <select
                defaultValue={a.status}
                disabled={pending}
                onChange={(ev) => startTransition(async () => { await setTeamApplicationStatus(a.id, ev.target.value as TeamApplicationStatus); router.refresh(); })}
                className="border border-line rounded-lg px-2 py-1 text-xs"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              {a.status === 'APPROVED' && canManageTeam && !promoted.has(a.id) && (
                <button
                  className="btn secondary text-xs"
                  disabled={pending}
                  onClick={() => startTransition(async () => {
                    await promoteApplicationToTeamMember(a.id);
                    setPromoted((s) => new Set(s).add(a.id));
                    router.refresh();
                  })}
                >
                  Add to team
                </button>
              )}
              {promoted.has(a.id) && <span className="text-xs text-frl-green-dark">Added ✓</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
