import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ResourceAdmin } from './resource-admin';

export default async function ResourcesAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'resources.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage resources.</p>;
  }
  const items = await db.resource.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Resource Centre</h1>
      <ResourceAdmin items={items} />
    </div>
  );
}
