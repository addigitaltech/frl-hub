import Link from 'next/link';
import Image from 'next/image';
import { getSettings } from '@/lib/get-settings';
import { MobileNav } from './mobile-nav';

const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/programs', label: 'Programs' },
  { href: '/blog', label: 'Journal' },
  { href: '/activities', label: 'Activities' },
  { href: '/events', label: 'Events' },
  { href: '/team', label: 'Team' },
  { href: '/verify', label: 'Verify' },
];

export async function SiteHeader({ tagline }: { tagline?: string }) {
  const settings = await getSettings();

  return (
    <header className="nav">
      <div className="container navin">
        <Link className="brand" href="/">
          <Image
            src={settings.logoPrimaryUrl || '/frl-logo.jpg'}
            alt={settings.orgName}
            width={48}
            height={48}
            unoptimized
          />
          <span>
            {settings.orgName}
            <small>{tagline ?? 'Digital home of ' + settings.orgName}</small>
          </span>
        </Link>
        <MobileNav items={PRIMARY_NAV} />
      </div>
    </header>
  );
}
