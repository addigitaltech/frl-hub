'use client';

import { useActionState } from 'react';
import { submitEnquiry, type SubmitState } from '@/lib/actions/enquiries';

export function ContactForm() {
  const initialState: SubmitState = { ok: false };
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);

  if (state.ok) {
    return <p className="lead">Thanks — we&apos;ve received your message and will be in touch soon.</p>;
  }

  return (
    <form action={formAction} className="space-y-3 max-w-lg">
      {/* Honeypot: hidden from real users via CSS, invisible to screen
          readers via aria-hidden + tabIndex, but present in the DOM for
          bots that blindly fill every field. */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>Website</label>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field"><label>Name</label><input name="name" required /></div>
      <div className="field"><label>Email</label><input type="email" name="email" required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field"><label>Phone (optional)</label><input name="phone" /></div>
        <div className="field"><label>Organisation (optional)</label><input name="organisation" /></div>
      </div>
      <div className="field"><label>Subject</label><input name="subject" /></div>
      <div className="field"><label>Message</label><textarea name="message" rows={5} required /></div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn primary">{pending ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
