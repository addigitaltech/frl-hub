import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { getSettings } from '@/lib/get-settings';
import { WhatsappForm } from './whatsapp-form';

export default async function WhatsappSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'whatsapp.manage')) {
    return <p className="text-sm text-muted">You do not have permission to manage WhatsApp settings.</p>;
  }
  const settings = await getSettings();
  return (
    <div>
      <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">SETTINGS</span>
      <h1 className="text-2xl font-extrabold mt-2 mb-1">WhatsApp</h1>
      <p className="text-muted text-sm mb-6">
        This configures the public "Chat on WhatsApp" link (opens wa.me with your number and default
        message) — spec Level 1. Level 2 (WhatsApp Business Cloud API for automated replies/webhooks)
        needs WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID in environment variables and is not built yet;
        those secrets are never exposed to the browser regardless.
      </p>
      <WhatsappForm settings={settings} />
    </div>
  );
}
