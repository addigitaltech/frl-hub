'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestimonialStatus } from '@prisma/client';
import { saveTestimonial, setTestimonialStatus, type SaveState } from '@/lib/actions/testimonials';

type T = { id: string; name: string; role: string | null; organisation: string | null; quote: string; status: TestimonialStatus; featured: boolean };

export function TestimonialAdmin({ items }: { items: T[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveTestimonial, initialState);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) { setShowForm(false); router.refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div>
      <button className="btn secondary mb-4" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ New testimonial'}
      </button>

      {showForm && (
        <form action={formAction} className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Name</label><input name="name" required /></div>
            <div className="field"><label>Role</label><input name="role" /></div>
          </div>
          <div className="field"><label>Organisation</label><input name="organisation" /></div>
          <div className="field"><label>Photo URL</label><input name="photoUrl" /></div>
          <div className="field"><label>Testimonial</label><textarea name="quote" rows={3} required /></div>
          <div className="field"><label>Video URL (optional)</label><input name="videoUrl" /></div>
          <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="featured" /> Featured</label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn primary text-sm">{pending ? 'Saving…' : 'Save'}</button>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {items.length === 0 && <p className="p-4 text-sm text-muted">None yet.</p>}
        {items.map((t) => (
          <div key={t.id} className="p-4 border-b border-line flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-sm">{t.name} {t.featured && <span className="pill greenpill">Featured</span>}</p>
              <p className="text-xs text-muted">{t.role}{t.organisation ? ` · ${t.organisation}` : ''}</p>
              <p className="text-sm mt-1">&ldquo;{t.quote}&rdquo;</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 items-end">
              <span className="pill graypill">{t.status}</span>
              {t.status !== 'APPROVED' && (
                <button className="text-xs text-frl-green-dark" disabled={busy} onClick={() => startTransition(async () => { await setTestimonialStatus(t.id, 'APPROVED'); router.refresh(); })}>Approve</button>
              )}
              {t.status !== 'REJECTED' && (
                <button className="text-xs text-red-600" disabled={busy} onClick={() => startTransition(async () => { await setTestimonialStatus(t.id, 'REJECTED'); router.refresh(); })}>Reject</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
