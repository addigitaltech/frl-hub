'use client';

import { useActionState } from 'react';
import { subscribeToNewsletter, type SubmitState } from '@/lib/actions/newsletter';

export function NewsletterForm() {
  const initialState: SubmitState = { ok: false };
  const [state, formAction, pending] = useActionState(subscribeToNewsletter, initialState);

  if (state.ok) {
    return <p style={{ fontWeight: 700, color: 'var(--green-dark)' }}>Thanks — check your inbox to confirm your subscription.</p>;
  }

  return (
    <form action={formAction} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
      <input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        className="border border-line rounded-lg px-3 py-2"
        style={{ minWidth: 240 }}
      />
      <button type="submit" disabled={pending} className="btn primary">
        {pending ? 'Subscribing…' : 'Subscribe to newsletter'}
      </button>
      {state.error && <p className="text-sm text-red-600" style={{ width: '100%' }}>{state.error}</p>}
    </form>
  );
}
