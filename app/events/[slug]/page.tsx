import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await db.event.findFirst({
    where: { slug, status: { in: ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'COMPLETED'] } },
    include: { program: { select: { name: true } } },
  });
  if (!event) notFound();

  return (
    <>
      <SiteHeader tagline="Events" />
      <main className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <span className="eyebrow">{event.status.replace('_', ' ')}</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>{event.title}</h1>
          <p className="lead" style={{ marginBottom: 20 }}>
            {event.startTime && new Date(event.startTime).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', dateStyle: 'full', timeStyle: 'short' })}
            {event.location && ` · ${event.location}`} · {event.mode}
            {event.program && ` · Part of ${event.program.name}`}
          </p>
          {event.featuredImageUrl && (
            <img src={event.featuredImageUrl} alt="" style={{ width: '100%', borderRadius: 18, marginBottom: 24 }} />
          )}
          <p style={{ lineHeight: 1.7, color: 'var(--muted)' }}>{event.description}</p>

          {event.status === 'REGISTRATION_OPEN' && event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noreferrer" className="btn primary" style={{ marginTop: 20, display: 'inline-flex' }}>
              Register
            </a>
          )}
          {event.status === 'REGISTRATION_CLOSED' && (
            <p className="pill graypill" style={{ marginTop: 20 }}>Registration closed</p>
          )}
          {event.registrationDeadline && event.status === 'REGISTRATION_OPEN' && (
            <p className="text-xs" style={{ color: 'var(--muted)', marginTop: 8 }}>
              Registration closes {new Date(event.registrationDeadline).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos' })}
            </p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
