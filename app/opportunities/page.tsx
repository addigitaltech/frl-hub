import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function OpportunitiesPage() {
  let opportunities: Awaited<ReturnType<typeof db.opportunity.findMany>> = [];
  try {
    opportunities = await db.opportunity.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ featured: 'desc' }, { deadline: 'asc' }],
    });
  } catch (err) {
    console.error('[Opportunities] could not load opportunities:', err);
  }

  return (
    <>
      <SiteHeader tagline="Opportunities" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">OPPORTUNITIES</span>
          <h1 style={{ fontSize: 44, letterSpacing: -2, margin: '12px 0 8px' }}>Scholarships, Internships &amp; More</h1>
          {opportunities.length === 0 ? (
            <p className="lead" style={{ marginTop: 20 }}>No opportunities are published right now.</p>
          ) : (
            <div className="grid3" style={{ marginTop: 24 }}>
              {opportunities.map((o) => (
                <div className="card" key={o.id}>
                  <span className="tag">{o.category || 'Opportunity'}{o.featured ? ' · Featured' : ''}</span>
                  <h2 style={{ fontSize: 20 }}>{o.title}</h2>
                  <p>{o.description}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {o.provider}{o.deadline && ` · Deadline: ${new Date(o.deadline).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}`}
                  </p>
                  {o.applicationUrl && (
                    <a href={o.applicationUrl} target="_blank" rel="noreferrer" className="btn secondary">Apply</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
