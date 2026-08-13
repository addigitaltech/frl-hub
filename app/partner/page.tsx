import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PartnerForm } from './partner-form';

export default function PartnerPage() {
  return (
    <>
      <SiteHeader tagline="Partner With FRL" />
      <main className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <span className="eyebrow">PARTNER WITH FRL</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>Bring FRL to your school or organisation</h1>
          <p className="lead" style={{ marginBottom: 24 }}>Tell us about your school, organisation or community — we&apos;ll follow up to explore how we can work together.</p>
          <PartnerForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
