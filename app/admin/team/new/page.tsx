import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { TeamMemberForm } from '../team-form';

export default async function NewTeamMemberPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'team.manage')) {
    return <p className="text-sm text-muted">You do not have permission to add team members.</p>;
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Add team member</h1>
      <TeamMemberForm />
      <p className="text-xs text-muted mt-3 max-w-2xl">
        An FRL ID (e.g. FRL-TEAM-0001) is assigned automatically. New members start as PENDING —
        set status to ACTIVE once approved before generating an ID card.
      </p>
    </div>
  );
}
