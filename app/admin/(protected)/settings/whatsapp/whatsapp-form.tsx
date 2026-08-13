'use client';

import { useActionState } from 'react';
import { saveWhatsappSettings, type SaveState } from '@/lib/actions/whatsapp';

export function WhatsappForm({ settings }: { settings: { whatsappNumber: string | null; whatsappDefaultMsg: string | null; whatsappEnabled: boolean } }) {
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveWhatsappSettings, initialState);

  return (
    <form action={formAction} className="bg-white border border-line rounded-2xl p-6 space-y-4 max-w-lg">
      <div className="field">
        <label>WhatsApp number (with country code)</label>
        <input name="whatsappNumber" defaultValue={settings.whatsappNumber ?? ''} placeholder="+234…" />
      </div>
      <div className="field">
        <label>Default message</label>
        <textarea name="whatsappDefaultMsg" defaultValue={settings.whatsappDefaultMsg ?? ''} rows={2} />
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="whatsappEnabled" defaultChecked={settings.whatsappEnabled} />
        Show WhatsApp button on the site
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}
      <button type="submit" disabled={pending} className="btn primary">{pending ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
