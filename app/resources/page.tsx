import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';
import { DownloadLink } from './download-link';

export default async function ResourcesPage() {
  const now = new Date();
  let resources: Awaited<ReturnType<typeof db.resource.findMany>> = [];
  try {
    resources = await db.resource.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (err) {
    console.error('[Resources] could not load resources:', err);
  }

  return (
    <>
      <SiteHeader tagline="Resource Centre" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">FRL RESOURCE CENTRE</span>
          <h1 style={{ fontSize: 44, letterSpacing: -2, margin: '12px 0 8px' }}>Resources</h1>
          <p className="lead">Guides, templates and materials to support students, schools and partners.</p>
          {resources.length === 0 ? (
            <p className="lead" style={{ marginTop: 20 }}>No resources published yet.</p>
          ) : (
            <div className="grid3" style={{ marginTop: 24 }}>
              {resources.map((r) => (
                <div className="card" key={r.id}>
                  <span className="tag">{r.category || 'Resource'}</span>
                  <h2 style={{ fontSize: 20 }}>{r.title}</h2>
                  <p>{r.description}</p>
                  <DownloadLink id={r.id} fileUrl={r.fileUrl} />
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
