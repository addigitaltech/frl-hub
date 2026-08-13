import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function Events() {
  let events: Awaited<ReturnType<typeof db.event.findMany>> = [];
  try {
    events = await db.event.findMany({
      where: { status: { in: ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED'] } },
      orderBy: { startTime: 'asc' },
    });
  } catch (err) {
    console.error('[Events] could not load events:', err);
  }

  return (
    <>
      <SiteHeader tagline="Events" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">EVENTS</span>
          <h1 style={{ fontSize: 48, letterSpacing: -2 }}>Upcoming Events</h1>
          {events.length === 0 ? (
            <p className="lead" style={{ marginTop: 20 }}>No upcoming events right now — check back soon.</p>
          ) : (
            <div className="grid3" style={{ marginTop: 30 }}>
              {events.map((e) => (
                <div className="card" key={e.id}>
                  <span className="tag">{e.mode}</span>
                  <h2 style={{ fontSize: 23 }}>{e.title}</h2>
                  <p>
                    {e.startTime && new Date(e.startTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}
                    {e.location && ` · ${e.location}`}
                  </p>
                  <Link href={`/events/${e.slug}`} className="btn secondary">View event</Link>
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
