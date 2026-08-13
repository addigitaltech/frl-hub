import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { ProgramForm } from '../program-form';

export default async function NewProgramPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'programs.manage')) {
    return <p className="text-sm text-muted">You do not have permission to create programs.</p>;
  }
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">New program</h1>
      <ProgramForm />
    </div>
  );
}
