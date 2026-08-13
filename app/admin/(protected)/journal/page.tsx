import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hasPermission } from '@/lib/rbac';
import { ArticleStatus } from '@prisma/client';

const TABS: { key: ArticleStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'IN_REVIEW', label: 'In review' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'ARCHIVED', label: 'Archived' },
  { key: 'TRASHED', label: 'Trash' },
];

export default async function JournalList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const canCreate = hasPermission(session.user.role, 'journal.create');
  const { status } = await searchParams;
  const filter = (status as ArticleStatus | undefined) ?? undefined;

  const articles = await db.article.findMany({
    where: filter ? { status: filter } : {},
    include: { author: { select: { name: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">
            FRL JOURNAL
          </span>
          <h1 className="text-2xl font-extrabold mt-2">Articles</h1>
        </div>
        {canCreate && (
          <Link href="/admin/journal/new" className="btn primary">
            + New article
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === 'ALL' ? '/admin/journal' : `/admin/journal?status=${tab.key}`}
            className={`pill ${filter === tab.key || (tab.key === 'ALL' && !filter) ? 'greenpill' : 'graypill'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {articles.length === 0 ? (
          <p className="p-6 text-sm text-muted">No articles in this view yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Author</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/journal/${a.id}`} className="font-bold hover:text-frl-green">
                      {a.title}
                    </Link>
                  </td>
                  <td>
                    <span className="pill graypill">{a.status.replace('_', ' ')}</span>
                  </td>
                  <td>{a.author?.name}</td>
                  <td>{new Date(a.updatedAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
