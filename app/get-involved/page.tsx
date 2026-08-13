import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { JoinTeamForm } from './join-team-form';

export default function GetInvolvedPage() {
  return (
    <>
      <SiteHeader tagline="Get Involved" />
      <main className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <span className="eyebrow">GET INVOLVED</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>Join Our Team</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            Interested in volunteering, partnering, or joining the FRL team?
            Fill in the form below to apply — or <a href="/partner" style={{ color: 'var(--green)', fontWeight: 800 }}>partner with FRL as a school or organisation</a>.
          </p>
          <JoinTeamForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
