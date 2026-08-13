import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function Team() {
  let members: Awaited<ReturnType<typeof db.teamMember.findMany>> = [];
  try {
    members = await db.teamMember.findMany({
      where: { status: 'ACTIVE', publicProfile: true },
      orderBy: { dateJoined: 'asc' },
    });
  } catch (err) {
    console.error('[Team] could not load team members:', err);
  }

  return (
    <>
      <SiteHeader tagline="Our People" />
      <main className="section">
        <div className="container">
          <span className="eyebrow">OUR PEOPLE</span>
          <h1 style={{ fontSize: 48, letterSpacing: -2 }}>The FRL Team</h1>
          {members.length === 0 ? (
            <p className="lead">No public team profiles yet.</p>
          ) : (
            <div className="grid3" style={{ marginTop: 30 }}>
              {members.map((m) => (
                <Link href={`/team/${m.frlId}`} className="card" key={m.id} style={{ display: 'block' }}>
                  {m.photoUrl && <img src={m.photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', marginBottom: 10 }} />}
                  <h2 style={{ fontSize: 20 }}>{m.fullName}</h2>
                  <p style={{ color: 'var(--muted)' }}>{m.position ?? 'Team Member'}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
