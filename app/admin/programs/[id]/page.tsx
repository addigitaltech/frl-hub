import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ProgramForm } from '../program-form';
import { ProgramStatusControl } from './status-control';

export default async function EditProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { id } = await params;
  const program = await db.program.findUnique({ where: { id } });
  if (!program) notFound();

  const canManage = hasPermission(session.user.role, 'programs.manage');

  return (
    <div>
      <span className="pill graypill">{program.status}</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-4">{program.name}</h1>

      {canManage && (
        <div className="bg-white border border-line rounded-2xl p-5 mb-6 max-w-2xl">
          <p className="text-sm font-bold mb-2">Status</p>
          <ProgramStatusControl id={program.id} status={program.status} />
        </div>
      )}

      {canManage ? (
        <ProgramForm program={program} />
      ) : (
        <p className="text-sm text-muted">You do not have permission to edit this program.</p>
      )}
    </div>
  );
}
