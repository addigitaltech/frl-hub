import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { EventForm } from '../event-form';

export default async function NewEventPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'events.manage')) {
    return <p className="text-sm text-muted">You do not have permission to create events.</p>;
  }
  const programs = await db.program.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">New event</h1>
      <EventForm programs={programs} />
    </div>
  );
}
