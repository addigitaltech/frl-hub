import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from './contact-form';

export default function ContactPage() {
  return (
    <>
      <SiteHeader tagline="Contact" />
      <main className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <span className="eyebrow">CONTACT</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>Get in touch</h1>
          <p className="lead" style={{ marginBottom: 24 }}>Questions, partnership ideas, or anything else — send us a message.</p>
          <ContactForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
