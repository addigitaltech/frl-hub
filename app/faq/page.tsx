import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/get-settings';
import { FaqAccordion } from './faq-accordion';

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    db.faq.findMany({ where: { published: true }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    getSettings(),
  ]);

  const whatsappHref =
    settings.whatsappEnabled && settings.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}${settings.whatsappDefaultMsg ? `?text=${encodeURIComponent(settings.whatsappDefaultMsg)}` : ''}`
      : null;

  return (
    <>
      <SiteHeader tagline="FAQ" />
      <main className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <span className="eyebrow">FAQ</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>Frequently Asked Questions</h1>
          <FaqAccordion faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category }))} />

          <div className="card" style={{ marginTop: 30, textAlign: 'center' }}>
            <p className="lead" style={{ margin: 0 }}>Still have questions?</p>
            {whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn orange" style={{ marginTop: 12, display: 'inline-flex' }}>
                Chat with us on WhatsApp
              </a>
            ) : (
              <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>WhatsApp contact isn&apos;t configured yet.</p>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
