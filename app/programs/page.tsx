import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function Programs() {
  let programs: Awaited<ReturnType<typeof db.program.findMany>> = [];
  try {
    programs = await db.program.findMany({
      where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (err) {
    console.error('[Programs] could not load programs:', err);
  }

  return (
    <>
      <SiteHeader tagline="Programs" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">PROGRAMS</span>
          <h1 style={{ fontSize: 48, letterSpacing: -2, margin: '16px 0 8px' }}>Our Programs</h1>
          {programs.length === 0 ? (
            <p className="lead">No active programs are published yet.</p>
          ) : (
            <div className="grid3">
              {programs.map((p) => (
                <div className="card" key={p.id}>
                  <span className="eyebrow">{p.status}</span>
                  <h2 style={{ fontSize: 24 }}>{p.name}</h2>
                  <p>{p.description}</p>
                  <Link href={`/programs/${p.slug}`} className="btn secondary">View program</Link>
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
