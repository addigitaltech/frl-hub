import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { unsubscribeFromNewsletter } from '@/lib/actions/newsletter';

export default async function Unsubscribe({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await unsubscribeFromNewsletter(token);

  return (
    <>
      <SiteHeader tagline="Newsletter" />
      <main className="section">
        <div className="container" style={{ maxWidth: 500, textAlign: 'center' }}>
          <h1>You&apos;ve been unsubscribed</h1>
          <p className="lead">You won&apos;t receive further FRL newsletter emails. You can resubscribe anytime from the homepage.</p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
