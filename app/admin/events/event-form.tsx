'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EventMode } from '@prisma/client';
import { saveEvent, type SaveEventState } from '@/lib/actions/events';

type EventData = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  mode: EventMode;
  capacity: number | null;
  startTime: Date | null;
  endTime: Date | null;
  registrationDeadline: Date | null;
  registrationUrl: string | null;
  featuredImageUrl: string | null;
  programId: string | null;
};

function toDatetimeInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 16) : '';
}

export function EventForm({ event, programs }: { event?: EventData; programs: { id: string; name: string }[] }) {
  const router = useRouter();
  const initialState: SaveEventState = { ok: false };
  const [state, formAction, pending] = useActionState(saveEvent, initialState);

  useEffect(() => {
    if (state.ok && state.id && !event) router.push(`/admin/events/${state.id}`);
  }, [state.ok, state.id, event, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl bg-white border border-line rounded-2xl p-6">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div className="field">
        <label>Title</label>
        <input name="title" defaultValue={event?.title} required />
      </div>

      <div className="field">
        <label>Description</label>
        <textarea name="description" defaultValue={event?.description ?? ''} rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label>Start time</label>
          <input type="datetime-local" name="startTime" defaultValue={toDatetimeInput(event?.startTime ?? null)} />
        </div>
        <div className="field">
          <label>End time</label>
          <input type="datetime-local" name="endTime" defaultValue={toDatetimeInput(event?.endTime ?? null)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label>Mode</label>
          <select name="mode" defaultValue={event?.mode ?? EventMode.OFFLINE}>
            <option value="OFFLINE">In-person</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div className="field">
          <label>Location</label>
          <input name="location" defaultValue={event?.location ?? ''} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="field">
          <label>Capacity</label>
          <input type="number" min={0} name="capacity" defaultValue={event?.capacity ?? ''} />
        </div>
        <div className="field">
          <label>Registration deadline</label>
          <input type="datetime-local" name="registrationDeadline" defaultValue={toDatetimeInput(event?.registrationDeadline ?? null)} />
        </div>
      </div>

      <div className="field">
        <label>Registration URL</label>
        <input name="registrationUrl" defaultValue={event?.registrationUrl ?? ''} />
      </div>

      <div className="field">
        <label>Program (optional)</label>
        <select name="programId" defaultValue={event?.programId ?? ''}>
          <option value="">— None —</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Featured image URL</label>
        <input name="featuredImageUrl" defaultValue={event?.featuredImageUrl ?? ''} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && event && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}

      <button type="submit" disabled={pending} className="btn primary">
        {pending ? 'Saving…' : event ? 'Save changes' : 'Create event'}
      </button>
    </form>
  );
}
