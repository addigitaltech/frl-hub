import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';

export default async function TeamList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  const canManage = hasPermission(session.user.role, 'team.manage');

  const members = await db.teamMember.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Team Members</h1>
        {canManage && <Link href="/admin/team/new" className="btn primary">+ Add member</Link>}
      </div>
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {members.length === 0 ? (
          <p className="p-6 text-sm text-muted">No team members yet.</p>
        ) : (
          <table className="table">
            <thead><tr><th>FRL ID</th><th>Name</th><th>Position</th><th>Status</th></tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="font-mono text-xs">{m.frlId}</td>
                  <td><Link href={`/admin/team/${m.id}`} className="font-bold hover:text-frl-green">{m.fullName}</Link></td>
                  <td>{m.position ?? '—'}</td>
                  <td><span className="pill graypill">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
