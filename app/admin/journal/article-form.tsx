'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/tiptap-editor';
import { saveArticle, type SaveArticleState } from '@/lib/actions/journal';

type Taxonomy = { id: string; name: string };

export function ArticleForm({
  article,
  categories,
  tags,
}: {
  article?: {
    id: string;
    title: string;
    excerpt: string | null;
    contentJson: unknown;
    featuredImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    categories: Taxonomy[];
    tags: Taxonomy[];
  };
  categories: Taxonomy[];
  tags: Taxonomy[];
}) {
  const router = useRouter();
  const initialState: SaveArticleState = { ok: false };
  const [state, formAction, pending] = useActionState(saveArticle, initialState);

  const [contentJson, setContentJson] = useState<object>((article?.contentJson as object) ?? {});
  const [contentHtml, setContentHtml] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(article?.categories.map((c) => c.id) ?? []);
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags.map((t) => t.id) ?? []);

  useEffect(() => {
    if (state.ok && state.articleId && !article) {
      // Newly created — move to its edit page so subsequent saves and
      // workflow actions (submit/approve/publish) operate on a real id.
      router.push(`/admin/journal/${state.articleId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok, state.articleId]);

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {article && <input type="hidden" name="articleId" value={article.id} />}
      <input type="hidden" name="contentJson" value={JSON.stringify(contentJson)} />
      <input type="hidden" name="contentHtml" value={contentHtml} />

      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="title">Title</label>
        <input id="title" name="title" required defaultValue={article?.title} className="w-full border border-line rounded-lg px-3 py-2 text-lg font-bold" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt ?? ''} className="w-full border border-line rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1" htmlFor="featuredImageUrl">Featured image URL</label>
        <input id="featuredImageUrl" name="featuredImageUrl" defaultValue={article?.featuredImageUrl ?? ''} className="w-full border border-line rounded-lg px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Content</label>
        <TiptapEditor
          initialContent={(article?.contentJson as object) ?? undefined}
          onChange={(json, html) => {
            setContentJson(json);
            setContentHtml(html);
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TaxonomyPicker label="Categories" name="categoryIds" items={categories} selected={selectedCategories} onChange={setSelectedCategories} />
        <TaxonomyPicker label="Tags" name="tagIds" items={tags} selected={selectedTags} onChange={setSelectedTags} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1" htmlFor="seoTitle">SEO title</label>
          <input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={article?.seoTitle ?? ''} className="w-full border border-line rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" htmlFor="seoDescription">SEO description</label>
          <input id="seoDescription" name="seoDescription" maxLength={160} defaultValue={article?.seoDescription ?? ''} className="w-full border border-line rounded-lg px-3 py-2" />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && article && <p className="text-sm text-frl-green-dark font-medium">Saved.</p>}

      <button type="submit" disabled={pending} className="bg-frl-green text-white font-bold rounded-lg px-5 py-2.5 disabled:opacity-60">
        {pending ? 'Saving…' : article ? 'Save changes' : 'Create draft'}
      </button>
    </form>
  );
}

function TaxonomyPicker({
  label,
  name,
  items,
  selected,
  onChange,
}: {
  label: string;
  name: string;
  items: Taxonomy[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-bold mb-1">{label}</p>
      <div className="border border-line rounded-lg p-3 max-h-36 overflow-y-auto space-y-1">
        {items.length === 0 && <p className="text-xs text-muted">None yet — add some under Journal → Taxonomy.</p>}
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={name}
              value={item.id}
              checked={selected.includes(item.id)}
              onChange={(e) =>
                onChange(e.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))
              }
            />
            {item.name}
          </label>
        ))}
      </div>
    </div>
  );
}
