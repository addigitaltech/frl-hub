import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { OpportunityAdmin } from './opportunity-admin';

export default async function OpportunitiesAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'opportunities.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage opportunities.</p>;
  }
  const items = await db.opportunity.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Opportunities</h1>
      <OpportunityAdmin items={items} />
    </div>
  );
}
