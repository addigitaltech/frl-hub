import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

async function getProgram(slug: string) {
  return db.program.findFirst({
    where: { slug, status: { in: ['ACTIVE', 'UPCOMING', 'COMPLETED'] } },
    include: {
      activities: { where: { status: 'PUBLISHED' }, orderBy: { date: 'desc' } },
      events: { where: { status: { in: ['UPCOMING', 'REGISTRATION_OPEN'] } }, orderBy: { startTime: 'asc' } },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) return {};
  return { title: program.seoTitle || program.name, description: program.seoDescription || program.description || undefined };
}

export default async function ProgramDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgram(slug);
  if (!program) notFound();

  return (
    <>
      <SiteHeader tagline="Programs" />
      <main className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <span className="eyebrow">{program.status}</span>
          <h1 style={{ fontSize: 40, letterSpacing: -1, margin: '12px 0' }}>{program.name}</h1>
          {program.featuredImageUrl && (
            <img src={program.featuredImageUrl} alt="" style={{ width: '100%', borderRadius: 18, marginBottom: 24 }} />
          )}
          <p className="lead" style={{ marginBottom: 20 }}>{program.description}</p>

          {program.objectives && (
            <>
              <h2 style={{ fontSize: 22 }}>Objectives</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>{program.objectives}</p>
            </>
          )}
          {program.targetAudience && (
            <>
              <h2 style={{ fontSize: 22 }}>Who it's for</h2>
              <p style={{ color: 'var(--muted)', lineHeight: 1.7, marginBottom: 20 }}>{program.targetAudience}</p>
            </>
          )}

          {program.registrationUrl && (
            <a href={program.registrationUrl} className="btn primary" target="_blank" rel="noreferrer">
              Register interest
            </a>
          )}

          {program.activities.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 22 }}>Related activities</h2>
              <ul>
                {program.activities.map((a) => <li key={a.id}>{a.title}</li>)}
              </ul>
            </div>
          )}
          {program.events.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: 22 }}>Upcoming events</h2>
              <ul>
                {program.events.map((e) => <li key={e.id}>{e.title}</li>)}
              </ul>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
