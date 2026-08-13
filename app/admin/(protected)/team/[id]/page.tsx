import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { TeamMemberForm } from '../team-form';
import { TeamStatusControl } from './status-control';

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) notFound();

  const canManage = hasPermission(session.user.role, 'team.manage');

  return (
    <div>
      <span className="pill graypill font-mono">{member.frlId}</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-4">{member.fullName}</h1>

      {canManage && (
        <div className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-2xl">
          <p className="text-sm font-bold mb-2">Status</p>
          <TeamStatusControl id={member.id} status={member.status} />
          {member.status === 'ACTIVE' && (
            <Link href={`/admin/team/${member.id}/id-card`} className="btn secondary text-sm mt-3 inline-block">
              Generate ID card
            </Link>
          )}
        </div>
      )}

      {canManage ? (
        <TeamMemberForm member={member} />
      ) : (
        <p className="text-sm text-muted">You do not have permission to edit this member.</p>
      )}
    </div>
  );
}
