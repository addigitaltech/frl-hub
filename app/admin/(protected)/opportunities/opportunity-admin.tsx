'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OpportunityStatus } from '@prisma/client';
import { saveOpportunity, deleteOpportunity, type SaveState } from '@/lib/actions/opportunities';

type O = { id: string; title: string; provider: string | null; category: string | null; deadline: Date | null; status: OpportunityStatus };

export function OpportunityAdmin({ items }: { items: O[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveOpportunity, initialState);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) { setShowForm(false); router.refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div>
      <button className="btn secondary mb-4" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ New opportunity'}
      </button>

      {showForm && (
        <form action={formAction} className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-xl space-y-3">
          <div className="field"><label>Title</label><input name="title" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Provider</label><input name="provider" /></div>
            <div className="field"><label>Category</label><input name="category" placeholder="Scholarship, Internship…" /></div>
          </div>
          <div className="field"><label>Description</label><textarea name="description" rows={3} /></div>
          <div className="field"><label>Eligibility</label><textarea name="eligibility" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Deadline</label><input type="date" name="deadline" /></div>
            <div className="field"><label>Location</label><input name="location" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="isOnline" /> Online / remote</label>
          <div className="field"><label>Application URL</label><input name="applicationUrl" /></div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="featured" /> Featured</label>
          <div className="field">
            <label>Status</label>
            <select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="EXPIRED">Expired</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn primary text-sm">{pending ? 'Saving…' : 'Save'}</button>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {items.length === 0 && <p className="p-4 text-sm text-muted">No opportunities yet.</p>}
        {items.map((o) => (
          <div key={o.id} className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{o.title}</p>
              <p className="text-xs text-muted">
                {o.provider || 'Unknown provider'} · {o.category || 'Uncategorised'}
                {o.deadline && ` · Deadline ${new Date(o.deadline).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="pill graypill">{o.status}</span>
              <button
                className="text-xs text-red-600"
                disabled={busy}
                onClick={() => { if (window.confirm('Delete this opportunity?')) startTransition(async () => { await deleteOpportunity(o.id); router.refresh(); }); }}
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
