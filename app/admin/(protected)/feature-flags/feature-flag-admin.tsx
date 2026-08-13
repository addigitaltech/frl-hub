'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setFeatureFlag } from '@/lib/actions/feature-flags';

type F = { key: string; label: string; description: string | null; enabled: boolean };

export function FeatureFlagAdmin({ flags }: { flags: F[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-3 max-w-2xl">
      {flags.map((f) => (
        <label key={f.key} className="bg-white border border-line rounded-2xl p-4 flex items-start justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-bold text-sm">{f.label}</p>
            <p className="text-xs text-muted">{f.description}</p>
            <p className="text-xs text-muted mt-1">Not built in this codebase yet — flag exists to gate the module once it is.</p>
          </div>
          <input
            type="checkbox"
            checked={f.enabled}
            disabled={pending}
            onChange={(e) => startTransition(async () => { await setFeatureFlag(f.key, e.target.checked); router.refresh(); })}
          />
        </label>
      ))}
    </div>
  );
}
