'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveTeamMember, type SaveTeamMemberState } from '@/lib/actions/team';

type MemberData = {
  id: string;
  fullName: string;
  position: string | null;
  department: string | null;
  bio: string | null;
  photoUrl: string | null;
  skills: string[];
  publicProfile: boolean;
};

export function TeamMemberForm({ member }: { member?: MemberData }) {
  const router = useRouter();
  const initialState: SaveTeamMemberState = { ok: false };
  const [state, formAction, pending] = useActionState(saveTeamMember, initialState);

  useEffect(() => {
    if (state.ok && state.id && !member) router.push(`/admin/team/${state.id}`);
  }, [state.ok, state.id, member, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl bg-white border border-line rounded-2xl p-6">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="field">
        <label>Full name</label>
        <input name="fullName" defaultValue={member?.fullName} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="field">
          <label>Position</label>
          <input name="position" defaultValue={member?.position ?? ''} />
        </div>
        <div className="field">
          <label>Department</label>
          <input name="department" defaultValue={member?.department ?? ''} />
        </div>
      </div>

      <div className="field">
        <label>Bio</label>
        <textarea name="bio" defaultValue={member?.bio ?? ''} rows={4} />
      </div>

      <div className="field">
        <label>Photo URL</label>
        <input name="photoUrl" defaultValue={member?.photoUrl ?? ''} />
      </div>

      <div className="field">
        <label>Skills (comma-separated)</label>
        <input name="skills" defaultValue={member?.skills.join(', ') ?? ''} />
      </div>

      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" name="publicProfile" defaultChecked={member?.publicProfile ?? true} />
        Show on public team page
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && member && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}

      <button type="submit" disabled={pending} className="btn primary">
        {pending ? 'Saving…' : member ? 'Save changes' : 'Add member'}
      </button>
    </form>
  );
}
