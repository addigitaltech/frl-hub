'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SocialPlatform } from '@prisma/client';
import { saveSocialLink, deleteSocialLink, type SaveState } from '@/lib/actions/social';

const PLATFORMS: SocialPlatform[] = ['FACEBOOK', 'INSTAGRAM', 'X', 'TIKTOK', 'YOUTUBE', 'LINKEDIN', 'WHATSAPP', 'TELEGRAM'];

type Existing = { platform: SocialPlatform; url: string; enabled: boolean; order: number };

export function SocialLinkAdmin({ existing }: { existing: Existing[] }) {
  const byPlatform = new Map(existing.map((e) => [e.platform, e]));
  return (
    <div className="space-y-3 max-w-2xl">
      {PLATFORMS.map((p) => (
        <PlatformRow key={p} platform={p} existing={byPlatform.get(p)} />
      ))}
    </div>
  );
}

function PlatformRow({ platform, existing }: { platform: SocialPlatform; existing?: Existing }) {
  const router = useRouter();
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveSocialLink, initialState);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) router.refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <form action={formAction} className="bg-white border border-line rounded-2xl p-4 flex items-center gap-3">
      <input type="hidden" name="platform" value={platform} />
      <b className="w-24 text-sm shrink-0">{platform.charAt(0) + platform.slice(1).toLowerCase()}</b>
      <input name="url" defaultValue={existing?.url ?? ''} placeholder="https://…" className="border border-line rounded-lg px-3 py-2 flex-1 text-sm" />
      <input type="number" name="order" defaultValue={existing?.order ?? 0} className="border border-line rounded-lg px-2 py-2 w-16 text-sm" title="Order" />
      <label className="flex items-center gap-1 text-xs shrink-0">
        <input type="checkbox" name="enabled" defaultChecked={existing?.enabled ?? true} /> On
      </label>
      <button type="submit" disabled={pending} className="btn secondary text-xs shrink-0">{pending ? 'Saving…' : 'Save'}</button>
      {existing && (
        <button
          type="button"
          disabled={busy}
          className="text-xs text-red-600 shrink-0"
          onClick={() => startTransition(async () => { await deleteSocialLink(platform); router.refresh(); })}
        >
          Remove
        </button>
      )}
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
