'use client';

import { useActionState, useState } from 'react';
import Image from 'next/image';
import type { Settings } from '@prisma/client';
import { updateBranding, type BrandingFormState } from '@/lib/actions/branding';

const initialState: BrandingFormState = { ok: false };

export function BrandingForm({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(updateBranding, initialState);

  return (
    <form action={formAction} className="bg-white border border-line rounded-2xl p-6 space-y-6 max-w-2xl">
      <div>
        <p className="text-sm font-bold mb-2">Current primary logo</p>
        <Image
          src={settings?.logoPrimaryUrl || '/frl-logo.jpg'}
          alt="Current logo"
          width={72}
          height={72}
          className="rounded-lg border border-line object-contain"
        />
        <label className="block text-sm font-bold mt-3 mb-1" htmlFor="logoPrimary">
          Replace primary logo
        </label>
        <input id="logoPrimary" name="logoPrimary" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="favicon">
          Favicon
        </label>
        <input id="favicon" name="favicon" type="file" accept="image/png,image/x-icon,image/svg+xml" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Organisation name" name="orgName" defaultValue={settings?.orgName ?? 'FutureReadiness Lab'} />
        <Field label="Default timezone" name="defaultTimezone" defaultValue={settings?.defaultTimezone ?? 'Africa/Lagos'} />
      </div>

      <FieldTextarea
        label="Tagline"
        name="tagline"
        defaultValue={settings?.tagline ?? ''}
      />

      <FieldTextarea
        label="Homepage announcement (optional)"
        name="homepageAnnouncement"
        defaultValue={settings?.homepageAnnouncement ?? ''}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ColorField label="Primary colour" name="colorPrimary" defaultValue={settings?.colorPrimary ?? '#16a34a'} />
        <ColorField label="Secondary colour" name="colorSecondary" defaultValue={settings?.colorSecondary ?? '#0f7a35'} />
        <ColorField label="Accent colour" name="colorAccent" defaultValue={settings?.colorAccent ?? '#f97316'} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-frl-green-dark font-medium">Branding updated.</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-frl-green text-white font-bold rounded-lg px-5 py-2.5 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} required className="border border-line rounded-lg px-3 py-2" />
    </div>
  );
}

function FieldTextarea({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={2} className="border border-line rounded-lg px-3 py-2" />
    </div>
  );
}

function ColorField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold" htmlFor={name}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-9 h-9 rounded border border-line"
          aria-hidden
        />
        <input
          id={name}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          className="border border-line rounded-lg px-3 py-2 w-full"
        />
      </div>
    </div>
  );
}
