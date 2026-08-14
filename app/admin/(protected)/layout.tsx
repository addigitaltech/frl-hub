import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { hasPermission, Capability } from '@/lib/rbac';
import { AdminSidebar } from './admin-sidebar';

type NavItem = { href: string; label: string; requires?: Capability };

// Every entry here is a real route. Items are only shown to roles whose
// permission table (lib/rbac.ts) actually grants them — no "#" links to
// screens that don't exist yet. Routes not built in this phase are simply
// omitted rather than faked.
const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/journal', label: 'Journal', requires: 'journal.create' },
  { href: '/admin/journal/taxonomy', label: 'Journal Taxonomy', requires: 'journal.create' },
  { href: '/admin/programs', label: 'Programs', requires: 'programs.manage' },
  { href: '/admin/activities', label: 'Activities', requires: 'activities.manage' },
  { href: '/admin/events', label: 'Events', requires: 'events.manage' },
  { href: '/admin/team', label: 'Team & Digital ID', requires: 'team.manage' },
  { href: '/admin/team-applications', label: 'Team Applications', requires: 'team_applications.manage' },
  { href: '/admin/resources', label: 'Resources', requires: 'resources.manage' },
  { href: '/admin/opportunities', label: 'Opportunities', requires: 'opportunities.manage' },
  { href: '/admin/faq', label: 'FAQ', requires: 'faq.manage' },
  { href: '/admin/testimonials', label: 'Testimonials', requires: 'testimonials.manage' },
  { href: '/admin/impact', label: 'Impact Metrics', requires: 'impact.manage' },
  { href: '/admin/enquiries', label: 'Enquiries', requires: 'enquiries.manage' },
  { href: '/admin/partnerships', label: 'Partnerships', requires: 'partnerships.manage' },
  { href: '/admin/newsletter', label: 'Newsletter', requires: 'newsletter.manage' },
  { href: '/admin/settings/branding', label: 'Branding', requires: 'settings.branding.manage' },
  { href: '/admin/settings/social', label: 'Social Media', requires: 'social.manage' },
  { href: '/admin/settings/whatsapp', label: 'WhatsApp', requires: 'whatsapp.manage' },
  { href: '/admin/feature-flags', label: 'Feature Flags', requires: 'feature_flags.manage' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  const { user } = session;
  const visibleNav = NAV.filter((item) => !item.requires || hasPermission(user.role, item.requires));

  return (
    <div className="min-h-screen bg-[#f3f6f4] md:grid md:grid-cols-[250px_1fr]">
      <AdminSidebar navItems={visibleNav} user={{ name: user.name, role: user.role }} />
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
