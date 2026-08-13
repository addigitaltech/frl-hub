import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ActivityForm } from '../activity-form';

export default async function NewActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'activities.manage')) {
    return <p className="text-sm text-muted">You do not have permission to create activities.</p>;
  }
  const programs = await db.program.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">New activity</h1>
      <ActivityForm programs={programs} />
    </div>
  );
}
