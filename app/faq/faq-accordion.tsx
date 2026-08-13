'use client';

import { useState, useMemo } from 'react';

type Faq = { id: string; question: string; answer: string; category: string | null };

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [faqs, query]);

  const categories = useMemo(() => {
    const map = new Map<string, Faq[]>();
    for (const f of filtered) {
      const key = f.category || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    return map;
  }, [filtered]);

  return (
    <div style={{ marginTop: 20 }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search FAQs…"
        className="border border-line rounded-lg px-3 py-2 w-full mb-6"
      />

      {filtered.length === 0 && <p className="lead">No FAQs match your search.</p>}

      {[...categories.entries()].map(([category, items]) => (
        <div key={category} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 10 }}>{category}</h2>
          {items.map((f) => (
            <div key={f.id} className="card" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => setOpen(open === f.id ? null : f.id)}>
              <p style={{ fontWeight: 800, margin: 0 }}>{f.question}</p>
              {open === f.id && <p style={{ color: 'var(--muted)', marginTop: 8 }}>{f.answer}</p>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
