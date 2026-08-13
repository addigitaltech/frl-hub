import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { FaqAdmin } from './faq-admin';

export default async function FaqAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'faq.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage the FAQ.</p>;
  }
  const items = await db.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">FAQ</h1>
      <FaqAdmin items={items} />
    </div>
  );
}
