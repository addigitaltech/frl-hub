import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { ensureDefaultFlags } from '@/lib/actions/feature-flags';
import { FeatureFlagAdmin } from './feature-flag-admin';

export default async function FeatureFlagsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'feature_flags.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage feature flags.</p>;
  }
  await ensureDefaultFlags();
  const flags = await db.featureFlag.findMany({ orderBy: { key: 'asc' } });
  return (
    <div>
      <h1 className="text-2xl font-extrabold mb-6">Feature Flags</h1>
      <FeatureFlagAdmin flags={flags} />
    </div>
  );
}
