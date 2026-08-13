import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ArticleForm } from '../article-form';

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'journal.create')) {
    return <p className="text-sm text-muted">You do not have permission to create articles.</p>;
  }

  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { order: 'asc' } }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div>
      <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">
        FRL JOURNAL
      </span>
      <h1 className="text-2xl font-extrabold mt-2 mb-6">New article</h1>
      <ArticleForm categories={categories} tags={tags} />
    </div>
  );
}
