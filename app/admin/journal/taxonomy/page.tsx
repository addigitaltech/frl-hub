import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { TaxonomyForms } from './taxonomy-forms';

export default async function TaxonomyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'journal.create')) {
    return <p className="text-sm text-muted">You do not have permission to manage taxonomy.</p>;
  }

  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { order: 'asc' } }),
    db.tag.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Journal taxonomy</h1>
      <TaxonomyForms categories={categories} tags={tags} />
    </div>
  );
}
