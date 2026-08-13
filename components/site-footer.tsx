import Link from 'next/link';
import Image from 'next/image';
import { getSettings } from '@/lib/get-settings';
import { db } from '@/lib/db';

export async function SiteFooter() {
  const settings = await getSettings();

  let socialLinks: { platform: string; url: string }[] = [];
  try {
    socialLinks = await db.socialLink.findMany({
      where: { enabled: true },
      orderBy: { order: 'asc' },
    });
  } catch (err) {
    console.error('[SiteFooter] could not load social links:', err);
  }

  return (
    <footer className="footer">
      <div className="container footergrid">
        <div>
          <div className="brand">
            <Image
              src={settings.logoPrimaryUrl || '/frl-logo.jpg'}
              alt={settings.orgName}
              width={48}
              height={48}
              unoptimized
            />
            <span>
              {settings.orgName}
              <small>FRL Hub</small>
            </span>
          </div>
          <p>{settings.tagline}</p>
        </div>
        <div>
          <b>Explore</b>
          <Link href="/about">About</Link>
          <Link href="/programs">Programs</Link>
          <Link href="/blog">FRL Journal</Link>
          <Link href="/activities">Activities</Link>
          <Link href="/events">Events</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/opportunities">Opportunities</Link>
          <Link href="/impact">Impact</Link>
          <Link href="/team">Our People</Link>
        </div>
        <div>
          <b>Get involved</b>
          <Link href="/get-involved">Join Our Team</Link>
          <Link href="/partner">Partner With FRL</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/verify">Verify an ID</Link>
        </div>
        <div>
          <b>Connect</b>
          {socialLinks.length === 0 && (
            <span className="text-[13px] text-[#7c9089]">
              No social links configured yet.
            </span>
          )}
          {socialLinks.map((link) => (
            <a key={link.platform} href={link.url} target="_blank" rel="noreferrer noopener">
              {link.platform.charAt(0) + link.platform.slice(1).toLowerCase()}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
