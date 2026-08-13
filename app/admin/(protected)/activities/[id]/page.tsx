import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ActivityForm } from '../activity-form';
import { ActivityStatusControl } from './status-control';

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const [activity, programs] = await Promise.all([
    db.activity.findUnique({ where: { id } }),
    db.program.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  if (!activity) notFound();

  const canManage = hasPermission(session.user.role, 'activities.manage');

  return (
    <div>
      <span className="pill graypill">{activity.status}</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-4">{activity.title}</h1>

      {canManage && (
        <div className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-2xl">
          <p className="text-sm font-bold mb-2">Status</p>
          <ActivityStatusControl id={activity.id} status={activity.status} />
        </div>
      )}

      {canManage ? (
        <ActivityForm activity={activity} programs={programs} />
      ) : (
        <p className="text-sm text-muted">You do not have permission to edit this activity.</p>
      )}
    </div>
  );
}
