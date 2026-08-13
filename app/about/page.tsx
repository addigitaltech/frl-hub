import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getSettings } from '@/lib/get-settings';
import { db } from '@/lib/db';

export default async function AboutPage() {
  const settings = await getSettings();
  let teamCount = 0;
  try {
    teamCount = await db.teamMember.count({ where: { status: 'ACTIVE' } });
  } catch (err) {
    console.error('[About] could not load team count:', err);
  }

  return (
    <>
      <SiteHeader tagline="About" />
      <main className="section">
        <div className="container" style={{ maxWidth: 720 }}>
          <span className="eyebrow">ABOUT</span>
          <h1 style={{ fontSize: 44, letterSpacing: -2, margin: '12px 0 8px' }}>About {settings.orgName}</h1>
          <p className="lead">{settings.tagline}</p>

          <p style={{ color: 'var(--muted)', lineHeight: 1.8, marginTop: 20 }}>
            {settings.orgName} is an education and youth-development initiative focused on preparing
            young people for the future of learning, work, technology and life. Our programs, activities
            and events are managed through FRL Hub — this same platform — so what you see reflects our
            actual, current work rather than a static description.
          </p>

          <div className="grid3" style={{ marginTop: 30 }}>
            <div className="card"><div className="icon">🎓</div><h3>Education</h3><p>Rethinking how young people learn and grow.</p></div>
            <div className="card"><div className="icon">💻</div><h3>Digital Skills</h3><p>Practical technology and future-work capability.</p></div>
            <div className="card"><div className="icon">💼</div><h3>Career Readiness</h3><p>Understanding careers and real opportunities.</p></div>
          </div>

          <p style={{ marginTop: 30, color: 'var(--muted)' }}>
            {teamCount > 0 ? `${teamCount} active team members` : 'Our team'} currently power this work — meet them on the{' '}
            <a href="/team" style={{ color: 'var(--green)', fontWeight: 800 }}>Team page</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
