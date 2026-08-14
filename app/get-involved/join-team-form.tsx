'use client';

import { useActionState } from 'react';
import { submitTeamApplication, type SubmitState } from '@/lib/actions/team-applications';

export function JoinTeamForm() {
  const initialState: SubmitState = { ok: false };
  const [state, formAction, pending] = useActionState(submitTeamApplication, initialState);

  if (state.ok) {
    return <p className="lead">Thanks for applying — we&apos;ll review your application and be in touch.</p>;
  }

  return (
    <form action={formAction} className="space-y-3 max-w-lg">
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <label>Website</label>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field"><label>Full name</label><input name="fullName" required /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="field"><label>Email</label><input type="email" name="email" required /></div>
        <div className="field"><label>Phone</label><input name="phone" /></div>
      </div>
      <div className="field"><label>Role you're applying for</label><input name="roleAppliedFor" /></div>
      <div className="field"><label>Tell us about yourself</label><textarea name="coverMessage" rows={4} /></div>
      <div className="field"><label>Resume/CV link (Google Drive, etc.)</label><input name="resumeUrl" /></div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn primary">{pending ? 'Submitting…' : 'Submit application'}</button>
    </form>
  );
}
