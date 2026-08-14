'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FaqForm } from './faq-form';
import { deleteFaq } from '@/lib/actions/faq';

type FaqData = { id: string; question: string; answer: string; category: string | null; order: number; published: boolean };

export function FaqAdmin({ items }: { items: FaqData[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<FaqData | 'new' | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white border border-line rounded-2xl overflow-hidden h-fit">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <b className="text-sm">All FAQs</b>
          <button className="btn secondary text-sm" onClick={() => setEditing('new')}>+ New</button>
        </div>
        {items.length === 0 && <p className="p-4 text-sm text-muted">None yet.</p>}
        {items.map((f) => (
          <div key={f.id} className="p-4 border-b border-line flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-sm">{f.question}</p>
              <p className="text-xs text-muted">{f.category || 'Uncategorised'} · {f.published ? 'Published' : 'Draft'}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="btn secondary text-xs" onClick={() => setEditing(f)}>Edit</button>
              <button
                className="text-xs text-red-600"
                disabled={pending}
                onClick={() => {
                  if (window.confirm('Delete this FAQ?')) {
                    startTransition(async () => { await deleteFaq(f.id); router.refresh(); });
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-line rounded-2xl p-5 h-fit">
        {editing ? (
          <FaqForm
            faq={editing === 'new' ? undefined : editing}
            onDone={() => { setEditing(null); router.refresh(); }}
          />
        ) : (
          <p className="text-sm text-muted">Select an FAQ to edit, or click + New.</p>
        )}
      </div>
    </div>
  );
}
