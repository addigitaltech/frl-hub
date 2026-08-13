import { db } from './db';
import type { Settings } from '@prisma/client';

export const DEFAULT_SETTINGS: Pick<
  Settings,
  | 'orgName'
  | 'tagline'
  | 'logoPrimaryUrl'
  | 'faviconUrl'
  | 'colorPrimary'
  | 'colorSecondary'
  | 'colorAccent'
  | 'defaultTimezone'
  | 'homepageAnnouncement'
  | 'whatsappNumber'
  | 'whatsappEnabled'
> = {
  orgName: 'FutureReadiness Lab',
  tagline: 'Preparing young minds for a future that is already here.',
  logoPrimaryUrl: '/frl-logo.jpg',
  faviconUrl: null,
  colorPrimary: '#16a34a',
  colorSecondary: '#0f7a35',
  colorAccent: '#f97316',
  defaultTimezone: 'Africa/Lagos',
  homepageAnnouncement: null,
  whatsappNumber: null,
  whatsappEnabled: false,
};

// Every branding-facing surface calls this instead of importing hardcoded
// values. If the Settings row doesn't exist yet (fresh install, DB not
// seeded) or the DB isn't reachable, we fall back to defaults rather than
// crash the site — but we never silently swallow errors, we log them.
export async function getSettings() {
  try {
    const settings = await db.settings.findUnique({ where: { id: 'default' } });
    return settings ?? DEFAULT_SETTINGS;
  } catch (err) {
    console.error('[getSettings] falling back to defaults:', err);
    return DEFAULT_SETTINGS;
  }
}
