'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveActivity, type SaveActivityState } from '@/lib/actions/activities';

type ActivityData = {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  outcomes: string | null;
  date: Date | null;
  location: string | null;
  featuredImageUrl: string | null;
  programId: string | null;
};

function toDatetimeInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 16) : '';
}

export function ActivityForm({
  activity,
  programs,
}: {
  activity?: ActivityData;
  programs: { id: string; name: string }[];
}) {
  const router = useRouter();
  const initialState: SaveActivityState = { ok: false };
  const [state, formAction, pending] = useActionState(saveActivity, initialState);

  useEffect(() => {
    if (state.ok && state.id && !activity) router.push(`/admin/activities/${state.id}`);
  }, [state.ok, state.id, activity, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl bg-white border border-line rounded-2xl p-6">
      {activity && <input type="hidden" name="id" value={activity.id} />}

      <div className="field">
        <label>Title</label>
        <input name="title" defaultValue={activity?.title} required />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea name="description" defaultValue={activity?.description ?? ''} rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label>Objectives</label>
          <textarea name="objectives" defaultValue={activity?.objectives ?? ''} rows={3} />
        </div>
        <div className="field">
          <label>Outcomes</label>
          <textarea name="outcomes" defaultValue={activity?.outcomes ?? ''} rows={3} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label>Date</label>
          <input type="datetime-local" name="date" defaultValue={toDatetimeInput(activity?.date ?? null)} />
        </div>
        <div className="field">
          <label>Location</label>
          <input name="location" defaultValue={activity?.location ?? ''} />
        </div>
      </div>

      <div className="field">
        <label>Program (optional)</label>
        <select name="programId" defaultValue={activity?.programId ?? ''}>
          <option value="">— None —</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Featured image URL</label>
        <input name="featuredImageUrl" defaultValue={activity?.featuredImageUrl ?? ''} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && activity && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}

      <button type="submit" disabled={pending} className="btn primary">
        {pending ? 'Saving…' : activity ? 'Save changes' : 'Create activity'}
      </button>
    </form>
  );
}
