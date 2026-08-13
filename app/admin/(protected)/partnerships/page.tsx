import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { PartnershipAdmin } from './partnership-admin';

export default async function PartnershipsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'partnerships.manage')) {
    return <p className="text-sm text-muted">You do not have permission to view partner applications.</p>;
  }
  const items = await db.partnerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">School &amp; Partner Applications</h1>
      <PartnershipAdmin items={items} />
    </div>
  );
}
