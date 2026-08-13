import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { NewsletterForm } from '@/components/newsletter-form';
import { db } from '@/lib/db';
import { ArticleStatus } from '@prisma/client';
import { getSettings } from '@/lib/get-settings';

// Impact metrics and testimonials now read real, admin-managed data.
async function getLatestArticles() {
  try {
    return await db.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      include: { categories: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });
  } catch (err) {
    console.error('[Home] could not load latest articles:', err);
    return [];
  }
}

export default async function Home() {
  const articles = await getLatestArticles();
  let metrics: Awaited<ReturnType<typeof db.impactMetric.findMany>> = [];
  try {
    metrics = await db.impactMetric.findMany({ where: { visible: true }, orderBy: { order: 'asc' }, take: 4 });
  } catch (err) {
    console.error('[Home] could not load impact metrics:', err);
  }
  const settings = await getSettings();
  const whatsappHref =
    settings.whatsappEnabled && settings.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}${settings.whatsappDefaultMsg ? `?text=${encodeURIComponent(settings.whatsappDefaultMsg)}` : ''}`
      : null;
  return (
    <>
      <div className="topbar">
        <div className="container">
          <span>FutureReadiness Lab — Learn. Connect. Participate. Grow.</span>
          <span>🇳🇬 Nigeria • Africa</span>
        </div>
      </div>
      <SiteHeader tagline="Preparing young minds for tomorrow" />
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">EDUCATION • MINDSET • DIGITAL SKILLS • CAREER</span>
              <h1>Preparing young minds for a <span>future</span> that is already here.</h1>
              <p>FutureReadiness Lab is an educational initiative helping young people develop the mindset, knowledge, digital skills and career awareness needed to navigate an evolving world.</p>
              <div className="actions">
                <Link className="btn primary" href="/activities">Explore our work →</Link>
                <Link className="btn secondary" href="/blog">Read FRL Journal</Link>
              </div>
            </div>
            <div className="hero-card">
              <img src="/frl-logo.jpg" alt="FutureReadiness Lab logo" />
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', fontWeight: 800 }}>
                FRL HUB • DIGITAL HOME OF FUTUREREADINESS LAB
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>What we focus on</h2>
                <p className="lead">Building the knowledge, mindset and practical capabilities young people need to participate confidently in the future.</p>
              </div>
            </div>
            <div className="grid4">
              {[
                ['🎓', 'Education', 'Helping young people rethink learning and education.'],
                ['🧠', 'Mindset', 'Challenging limiting beliefs and building responsible learners.'],
                ['💻', 'Digital Skills', 'Developing practical technology and future-work skills.'],
                ['💼', 'Career Readiness', 'Helping students understand careers and opportunities.'],
              ].map((x) => (
                <div className="card" key={x[1]}>
                  <div className="icon">{x[0]}</div>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Our impact</h2>
                <p className="lead">These figures will be controlled from the FRL Hub admin dashboard as the organisation grows.</p>
              </div>
            </div>
            <div className="stats">
              {metrics.length === 0 ? (
                <p className="lead">No impact metrics have been published yet.</p>
              ) : (
                metrics.map((m) => (
                  <div className="stat" key={m.id}><b>{m.number}{m.suffix}</b><span>{m.label}</span></div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2>Latest from FRL Journal</h2>
                <p className="lead">Ideas, insights, activities and updates from FutureReadiness Lab.</p>
              </div>
              <Link href="/blog" className="btn secondary">View all</Link>
            </div>
            {articles.length === 0 ? (
              <p className="lead">No articles have been published yet.</p>
            ) : (
              <div className="grid3">
                {articles.map((a) => (
                  <Link href={`/blog/${a.slug}`} className="article" key={a.id} style={{ display: 'block' }}>
                    <span className="tag">{a.categories[0]?.name ?? 'FRL Update'}</span>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span style={{ fontWeight: 800, color: 'var(--green)' }}>Read article →</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <span className="eyebrow">STAY CONNECTED</span>
              <h2 style={{ marginTop: 16 }}>Don&apos;t miss what we&apos;re building.</h2>
              <p className="lead" style={{ margin: 'auto' }}>Subscribe to the FRL newsletter for new articles, opportunities, activities and important updates.</p>
              <div className="actions" style={{ justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <NewsletterForm />
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn orange" style={{ marginTop: 12 }}>
                    Chat with us on WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
