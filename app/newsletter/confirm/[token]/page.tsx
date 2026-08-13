import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { confirmNewsletterSubscription } from '@/lib/actions/newsletter';

export default async function ConfirmSubscription({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await confirmNewsletterSubscription(token);

  return (
    <>
      <SiteHeader tagline="Newsletter" />
      <main className="section">
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <h1>Subscription confirmed</h1>
          <p className="lead">You&apos;re on the list — thanks for subscribing to FRL updates.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
