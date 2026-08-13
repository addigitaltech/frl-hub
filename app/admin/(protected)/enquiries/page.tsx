import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { EnquiryAdmin } from './enquiry-admin';

export default async function EnquiriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'enquiries.manage')) {
    return <p className="text-sm text-muted">You do not have permission to view enquiries.</p>;
  }
  const [items, admins] = await Promise.all([
    db.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    db.user.findMany({ where: { status: 'ACTIVE' }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Enquiries</h1>
      <EnquiryAdmin items={items} admins={admins} />
    </div>
  );
}
