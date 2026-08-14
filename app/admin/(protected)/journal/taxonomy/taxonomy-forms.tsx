'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory, createTag } from '@/lib/actions/taxonomy';

export function TaxonomyForms({
  categories,
  tags,
}: {
  categories: { id: string; name: string }[];
  tags: { id: string; name: string }[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
      <Panel title="Categories" items={categories} action={createCategory} />
      <Panel title="Tags" items={tags} action={createTag} />
    </div>
  );
}

function Panel({
  title,
  items,
  action,
}: {
  title: string;
  items: { id: string; name: string }[];
  action: (name: string) => Promise<void>;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <div className="bg-white border border-line rounded-2xl p-5">
      <h2 className="font-bold mb-3">{title}</h2>
      <ul className="text-sm text-muted space-y-1 mb-4">
        {items.length === 0 && <li>None yet.</li>}
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          startTransition(async () => {
            await action(name.trim());
            setName('');
            router.refresh();
          });
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`New ${title.slice(0, -1).toLowerCase()} name`}
          className="border border-line rounded-lg px-3 py-2 flex-1 text-sm"
        />
        <button type="submit" disabled={pending} className="btn secondary text-sm">
          {pending ? 'Adding…' : 'Add'}
        </button>
      </form>
    </div>
  );
}
