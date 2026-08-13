'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceStatus } from '@prisma/client';
import { saveResource, deleteResource, type SaveState } from '@/lib/actions/resources';

type R = { id: string; title: string; category: string | null; fileUrl: string; status: ResourceStatus; downloadCount: number };

export function ResourceAdmin({ items }: { items: R[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveResource, initialState);
  const [busy, startTransition] = useTransition();

  useEffect(() => {
    if (state.ok) { setShowForm(false); router.refresh(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div>
      <button className="btn secondary mb-4" onClick={() => setShowForm((s) => !s)}>
        {showForm ? 'Cancel' : '+ New resource'}
      </button>

      {showForm && (
        <form action={formAction} className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-xl space-y-3">
          <div className="field"><label>Title</label><input name="title" required /></div>
          <div className="field"><label>Description</label><textarea name="description" rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="field"><label>Category</label><input name="category" /></div>
            <div className="field"><label>Author</label><input name="author" /></div>
          </div>
          <div className="field"><label>File URL</label><input name="fileUrl" required placeholder="https://…" /></div>
          <div className="field"><label>Thumbnail URL</label><input name="thumbnailUrl" /></div>
          <div className="field"><label>Tags (comma-separated)</label><input name="tags" /></div>
          <div className="field">
            <label>Status</label>
            <select name="status" defaultValue="DRAFT">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn primary text-sm">{pending ? 'Saving…' : 'Save'}</button>
        </form>
      )}

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {items.length === 0 && <p className="p-4 text-sm text-muted">No resources yet.</p>}
        {items.map((r) => (
          <div key={r.id} className="p-4 border-b border-line flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">{r.title}</p>
              <p className="text-xs text-muted">{r.category || 'Uncategorised'} · {r.downloadCount} downloads</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="pill graypill">{r.status}</span>
              <button
                className="text-xs text-red-600"
                disabled={busy}
                onClick={() => { if (window.confirm('Delete this resource?')) startTransition(async () => { await deleteResource(r.id); router.refresh(); }); }}
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
