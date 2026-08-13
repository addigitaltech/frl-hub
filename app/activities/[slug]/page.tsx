import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function ActivityDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const activity = await db.activity.findFirst({
    where: { slug, status: { in: ['PUBLISHED', 'COMPLETED'] } },
    include: { program: { select: { name: true, slug: true } } },
  });
  if (!activity) notFound();

  return (
    <>
      <SiteHeader tagline="Activities" />
      <main className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <span className="eyebrow">{activity.status}</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>{activity.title}</h1>
          <p className="lead" style={{ marginBottom: 20 }}>
            {activity.date && new Date(activity.date).toLocaleDateString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'long', year: 'numeric' })}
            {activity.location && ` · ${activity.location}`}
            {activity.program && ` · Part of ${activity.program.name}`}
          </p>
          {activity.featuredImageUrl && (
            <img src={activity.featuredImageUrl} alt="" style={{ width: '100%', borderRadius: 18, marginBottom: 24 }} />
          )}
          <p style={{ lineHeight: 1.7, color: 'var(--muted)' }}>{activity.description}</p>
          {activity.objectives && (
            <>
              <h2 style={{ fontSize: 22, marginTop: 24 }}>Objectives</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{activity.objectives}</p>
            </>
          )}
          {activity.outcomes && (
            <>
              <h2 style={{ fontSize: 22, marginTop: 24 }}>Outcomes</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{activity.outcomes}</p>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
