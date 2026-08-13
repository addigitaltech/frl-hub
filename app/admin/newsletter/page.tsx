import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { NewsletterAdmin } from './newsletter-admin';

export default async function NewsletterPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'newsletter.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage the newsletter.</p>;
  }
  const [campaigns, confirmedCount] = await Promise.all([
    db.newsletterCampaign.findMany({ orderBy: { createdAt: 'desc' } }),
    db.newsletterSubscriber.count({ where: { status: 'CONFIRMED' } }),
  ]);
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Newsletter</h1>
      <NewsletterAdmin campaigns={campaigns} confirmedCount={confirmedCount} />
    </div>
  );
}
