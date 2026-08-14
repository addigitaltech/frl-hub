import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';

export default async function ActivitiesList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  const canManage = hasPermission(session.user.role, 'activities.manage');

  const activities = await db.activity.findMany({ orderBy: { updatedAt: 'desc' }, include: { program: { select: { name: true } } } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Activities</h1>
        {canManage && <Link href="/admin/activities/new" className="btn primary">+ New activity</Link>}
      </div>
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {activities.length === 0 ? (
          <p className="p-6 text-sm text-muted">No activities yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
            <thead><tr><th>Title</th><th>Program</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/admin/activities/${a.id}`} className="font-bold hover:text-frl-green">{a.title}</Link></td>
                  <td>{a.program?.name ?? '—'}</td>
                  <td><span className="pill graypill">{a.status}</span></td>
                  <td>{a.date ? new Date(a.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
