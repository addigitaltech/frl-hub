'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveProgram, type SaveProgramState } from '@/lib/actions/programs';

type ProgramData = {
  id: string;
  name: string;
  description: string | null;
  objectives: string | null;
  targetAudience: string | null;
  featuredImageUrl: string | null;
  registrationUrl: string | null;
  startDate: Date | null;
  endDate: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

function toDateInput(d: Date | null) {
  return d ? new Date(d).toISOString().slice(0, 10) : '';
}

export function ProgramForm({ program }: { program?: ProgramData }) {
  const router = useRouter();
  const initialState: SaveProgramState = { ok: false };
  const [state, formAction, pending] = useActionState(saveProgram, initialState);

  useEffect(() => {
    if (state.ok && state.id && !program) router.push(`/admin/programs/${state.id}`);
  }, [state.ok, state.id, program, router]);

  return (
    <form action={formAction} className="space-y-4 max-w-2xl bg-white border border-line rounded-2xl p-6">
      {program && <input type="hidden" name="id" value={program.id} />}

      <F label="Program name" name="name" defaultValue={program?.name} required />
      <TA label="Description" name="description" defaultValue={program?.description ?? ''} />
      <TA label="Objectives" name="objectives" defaultValue={program?.objectives ?? ''} />
      <TA label="Target audience" name="targetAudience" defaultValue={program?.targetAudience ?? ''} rows={2} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <F label="Start date" name="startDate" type="date" defaultValue={toDateInput(program?.startDate ?? null)} />
        <F label="End date" name="endDate" type="date" defaultValue={toDateInput(program?.endDate ?? null)} />
      </div>

      <F label="Featured image URL" name="featuredImageUrl" defaultValue={program?.featuredImageUrl ?? ''} />
      <F label="Registration URL" name="registrationUrl" defaultValue={program?.registrationUrl ?? ''} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <F label="SEO title" name="seoTitle" defaultValue={program?.seoTitle ?? ''} />
        <F label="SEO description" name="seoDescription" defaultValue={program?.seoDescription ?? ''} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && program && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}

      <button type="submit" disabled={pending} className="btn primary">
        {pending ? 'Saving…' : program ? 'Save changes' : 'Create program'}
      </button>
    </form>
  );
}

function F({ label, name, defaultValue, required, type = 'text' }: { label: string; name: string; defaultValue?: string; required?: boolean; type?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input name={name} defaultValue={defaultValue} required={required} type={type} />
    </div>
  );
}

function TA({ label, name, defaultValue, rows = 4 }: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea name={name} defaultValue={defaultValue} rows={rows} />
    </div>
  );
}
