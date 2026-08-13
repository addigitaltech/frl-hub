import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { EventForm } from '../event-form';
import { EventStatusControl } from './status-control';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const [event, programs] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.program.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);
  if (!event) notFound();

  const canManage = hasPermission(session.user.role, 'events.manage');

  return (
    <div>
      <span className="pill graypill">{event.status.replace('_', ' ')}</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-4">{event.title}</h1>

      {canManage && (
        <div className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-2xl">
          <p className="text-sm font-bold mb-2">Status</p>
          <EventStatusControl id={event.id} status={event.status} />
        </div>
      )}

      {canManage ? (
        <EventForm event={event} programs={programs} />
      ) : (
        <p className="text-sm text-muted">You do not have permission to edit this event.</p>
      )}
    </div>
  );
}
