'use client';

import { useActionState } from 'react';
import { submitPartnerApplication, type SubmitState } from '@/lib/actions/partnerships';

export function PartnerForm() {
  const initialState: SubmitState = { ok: false };
  const [state, formAction, pending] = useActionState(submitPartnerApplication, initialState);

  if (state.ok) {
    return <p className="lead">Thanks for your interest in partnering with FRL — our team will review your application and reach out.</p>;
  }

  return (
    <form action={formAction} className="space-y-3 max-w-lg">
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>Website</label>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field"><label>Organisation / school name</label><input name="organisation" required /></div>
      <div className="field"><label>Contact person</label><input name="contactPerson" required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field"><label>Email</label><input type="email" name="email" required /></div>
        <div className="field"><label>Phone</label><input name="phone" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field"><label>Location</label><input name="location" /></div>
        <div className="field"><label>Organisation type</label><input name="organisationType" placeholder="Secondary school, NGO…" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field"><label>Number of students/participants</label><input type="number" name="participantCount" /></div>
        <div className="field"><label>Preferred date</label><input type="date" name="preferredDate" /></div>
      </div>
      <div className="field"><label>Interested program</label><input name="interestedProgram" /></div>
      <div className="field"><label>Message</label><textarea name="message" rows={4} /></div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn primary">{pending ? 'Submitting…' : 'Submit application'}</button>
    </form>
  );
}
