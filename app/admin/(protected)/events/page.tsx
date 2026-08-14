import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';

export default async function EventsList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  const canManage = hasPermission(session.user.role, 'events.manage');

  const events = await db.event.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Events</h1>
        {canManage && <Link href="/admin/events/new" className="btn primary">+ New event</Link>}
      </div>
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {events.length === 0 ? (
          <p className="p-6 text-sm text-muted">No events yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
            <thead><tr><th>Title</th><th>Mode</th><th>Status</th><th>Starts</th></tr></thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td><Link href={`/admin/events/${e.id}`} className="font-bold hover:text-frl-green">{e.title}</Link></td>
                  <td>{e.mode}</td>
                  <td><span className="pill graypill">{e.status.replace('_', ' ')}</span></td>
                  <td>{e.startTime ? new Date(e.startTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' }) : '—'}</td>
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
