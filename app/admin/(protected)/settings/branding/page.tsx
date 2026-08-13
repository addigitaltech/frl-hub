import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { BrandingForm } from './branding-form';

export default async function BrandingSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'settings.branding.manage')) {
    return (
      <div className="bg-white border border-line rounded-2xl p-6">
        <h1 className="font-bold text-lg mb-1">Branding</h1>
        <p className="text-muted text-sm">
          Your role ({session.user.role.replace(/_/g, ' ')}) does not have access to this section.
        </p>
      </div>
    );
  }

  // Real settings row, created on first save if it doesn't exist yet —
  // never a hardcoded fallback logo baked into the app.
  const settings = await db.settings.findUnique({ where: { id: 'default' } });

  return (
    <div>
      <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">
        SETTINGS
      </span>
      <h1 className="text-2xl font-extrabold mt-2 mb-1">Branding</h1>
      <p className="text-muted text-sm mb-6">
        Changes here apply everywhere the FRL identity is shown: the website, admin, ID cards,
        certificates, verification pages, and emails.
      </p>
      <BrandingForm settings={settings} />
    </div>
  );
}
