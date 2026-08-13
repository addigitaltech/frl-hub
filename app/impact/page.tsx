import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function ImpactPage() {
  const [metrics, testimonials] = await Promise.all([
    db.impactMetric.findMany({ where: { visible: true }, orderBy: { order: 'asc' } }),
    db.testimonial.findMany({ where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ]);

  return (
    <>
      <SiteHeader tagline="Impact" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">IMPACT</span>
          <h1 style={{ fontSize: 44, letterSpacing: -2, margin: '12px 0 8px' }}>Our Impact</h1>

          {metrics.length === 0 ? (
            <p className="lead">No impact metrics have been published yet.</p>
          ) : (
            <div className="stats" style={{ marginTop: 20 }}>
              {metrics.map((m) => (
                <div className="stat" key={m.id}><b>{m.number}{m.suffix}</b><span>{m.label}</span></div>
              ))}
            </div>
          )}

          {testimonials.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 24, marginBottom: 16 }}>What people say</h2>
              <div className="grid3">
                {testimonials.map((t) => (
                  <div className="card" key={t.id}>
                    <p style={{ fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                    <p style={{ fontWeight: 800, marginTop: 10 }}>{t.name}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 13 }}>{t.role}{t.organisation ? ` · ${t.organisation}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
