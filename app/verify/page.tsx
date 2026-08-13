import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { VerifyForm } from './verify-form';

export default function Verify() {
  return (
    <>
      <SiteHeader tagline="Verification Centre" />
      <main className="verify">
        <div className="card" style={{ marginTop: 25 }}>
          <span className="eyebrow">FRL VERIFICATION CENTRE</span>
          <h1>Verify an FRL credential</h1>
          <p className="lead">Enter an FRL Team ID, or scan the QR code printed on an FRL credential with your phone's camera — it opens the result directly.</p>
          <VerifyForm />
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <div className="verify-card">
            <img src="/frl-logo.jpg" alt="FRL" />
            <div>
              <span className="check">LIVE</span>
              <h2>Team member verification is active</h2>
              <p>Each credential resolves against the live FRL database, so a status change (suspended, deactivated) is reflected immediately without reissuing the printed card. Volunteer, certificate, event-credential and partner verification are architected for but not yet built — see the roadmap.</p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
