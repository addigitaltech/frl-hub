import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function Activities() {
  let activities: Awaited<ReturnType<typeof db.activity.findMany>> = [];
  try {
    activities = await db.activity.findMany({
      where: { status: { in: ['PUBLISHED', 'COMPLETED'] } },
      orderBy: { date: 'desc' },
      take: 30,
    });
  } catch (err) {
    console.error('[Activities] could not load activities:', err);
  }

  return (
    <>
      <SiteHeader tagline="Activities" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">OUR WORK</span>
          <h1 style={{ fontSize: 48, letterSpacing: -2 }}>Activities &amp; Impact</h1>
          <p className="lead">A living archive of workshops, school outreach, career sessions, digital-skills programs and community activities.</p>
          {activities.length === 0 ? (
            <p className="lead" style={{ marginTop: 20 }}>No activities have been published yet.</p>
          ) : (
            <div className="grid3" style={{ marginTop: 30 }}>
              {activities.map((a) => (
                <div className="card" key={a.id}>
                  <span className="tag">{a.date ? new Date(a.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' }) : 'ACTIVITY'}</span>
                  <h2 style={{ fontSize: 23 }}>{a.title}</h2>
                  <p>{a.description}</p>
                  <Link href={`/activities/${a.slug}`} className="btn secondary">View activity</Link>
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
