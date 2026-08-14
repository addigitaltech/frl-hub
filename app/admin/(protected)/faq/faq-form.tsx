'use client';

import { useActionState, useEffect } from 'react';
import { saveFaq, type SaveState } from '@/lib/actions/faq';

type FaqData = { id: string; question: string; answer: string; category: string | null; order: number; published: boolean };

export function FaqForm({ faq, onDone }: { faq?: FaqData; onDone?: () => void }) {
  const initialState: SaveState = { ok: false };
  const [state, formAction, pending] = useActionState(saveFaq, initialState);

  useEffect(() => {
    if (state.ok) onDone?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <form action={formAction} className="space-y-3">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <div className="field">
        <label>Question</label>
        <input name="question" defaultValue={faq?.question} required />
      </div>
      <div className="field">
        <label>Answer</label>
        <textarea name="answer" defaultValue={faq?.answer} rows={3} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field">
          <label>Category</label>
          <input name="category" defaultValue={faq?.category ?? ''} />
        </div>
        <div className="field">
          <label>Order</label>
          <input type="number" name="order" defaultValue={faq?.order ?? 0} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="published" defaultChecked={faq?.published ?? false} />
        Published
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn primary text-sm">
        {pending ? 'Saving…' : faq ? 'Save changes' : 'Add FAQ'}
      </button>
    </form>
  );
}
