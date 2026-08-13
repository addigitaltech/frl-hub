import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ImpactAdmin } from './impact-admin';

export default async function ImpactPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'impact.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage impact metrics.</p>;
  }
  const items = await db.impactMetric.findMany({ orderBy: { order: 'asc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Impact metrics</h1>
      <ImpactAdmin items={items} />
    </div>
  );
}
