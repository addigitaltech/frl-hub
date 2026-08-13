import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { TeamApplicationAdmin } from './team-application-admin';

export default async function TeamApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'team_applications.manage')) {
    return <p className="text-sm text-muted">You do not have permission to view team applications.</p>;
  }
  const items = await db.teamApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Team Applications</h1>
      <TeamApplicationAdmin items={items} canManageTeam={hasPermission(session.user.role, 'team.manage')} />
    </div>
  );
}
