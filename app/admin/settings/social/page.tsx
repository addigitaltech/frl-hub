import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { SocialLinkAdmin } from './social-admin';

export default async function SocialSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'social.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage social links.</p>;
  }
  const existing = await db.socialLink.findMany();
  return (
    <div>
      <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">SETTINGS</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-1">Social Media</h1>
      <p className="text-muted text-sm mb-6">These links appear in the site footer automatically wherever enabled.</p>
      <SocialLinkAdmin existing={existing} />
    </div>
  );
}
