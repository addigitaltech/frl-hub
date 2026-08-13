import type { Metadata } from 'next';
import './globals.css';
import { getSettings } from '@/lib/get-settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.orgName} | FRL Hub`,
    description: settings.tagline,
    icons: settings.faviconUrl ? [{ url: settings.faviconUrl }] : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  // Brand colors set as CSS custom properties from the DB, read by both
  // the legacy hand-written CSS (var(--green) etc.) and the Tailwind
  // config (tailwind.config.ts maps frl-green -> var(--green)). Changing
  // a color in Admin -> Settings -> Branding updates the whole site.
  const brandStyle = {
    ['--green' as string]: settings.colorPrimary,
    ['--green-dark' as string]: settings.colorSecondary,
    ['--orange' as string]: settings.colorAccent,
  } as React.CSSProperties;

  return (
    <html lang="en" style={brandStyle}>
      <body>{children}</body>
    </html>
  );
}
