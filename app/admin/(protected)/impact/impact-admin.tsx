'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveImpactMetric, deleteImpactMetric, type SaveState } from '@/lib/actions/impact';

type M = { id: string; label: string; number: number; suffix: string; description: string | null; order: number; visible: boolean };

export function ImpactAdmin({ items }: { items: M[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveImpactMetric, initialState);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) { setShowForm(false); router.refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div>
      <button className="btn secondary mb-4" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ New metric'}
      </button>

      {showForm && (
        <form action={formAction} className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="field"><label>Label</label><input name="label" required /></div>
            <div className="field"><label>Number</label><input type="number" name="number" required /></div>
            <div className="field"><label>Suffix</label><input name="suffix" defaultValue="+" /></div>
          </div>
          <div className="field"><label>Description (optional)</label><input name="description" /></div>
          <div className="field"><label>Order</label><input type="number" name="order" defaultValue={0} /></div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="visible" defaultChecked /> Visible on homepage</label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn primary text-sm">{pending ? 'Saving…' : 'Save'}</button>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {items.length === 0 && <p className="p-4 text-sm text-muted">No metrics yet — the homepage will show 0 for each stat until these are added.</p>}
        {items.map((m) => (
          <div key={m.id} className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <p className="font-bold">{m.number}{m.suffix} <span className="text-muted font-normal">{m.label}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="pill graypill">{m.visible ? 'Visible' : 'Hidden'}</span>
              <button
                className="text-xs text-red-600"
                disabled={busy}
                onClick={() => { if (window.confirm('Delete this metric?')) startTransition(async () => { await deleteImpactMetric(m.id); router.refresh(); }); }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
