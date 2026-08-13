import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';

export default async function ProgramsList() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  const canManage = hasPermission(session.user.role, 'programs.manage');

  const programs = await db.program.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Programs</h1>
        {canManage && (
          <Link href="/admin/programs/new" className="btn primary">
            + New program
          </Link>
        )}
      </div>
      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {programs.length === 0 ? (
          <p className="p-6 text-sm text-muted">No programs yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Status</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td><Link href={`/admin/programs/${p.id}`} className="font-bold hover:text-frl-green">{p.name}</Link></td>
                  <td><span className="pill graypill">{p.status}</span></td>
                  <td>{new Date(p.updatedAt).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
