import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/db';

export default async function TeamMemberProfile({ params }: { params: Promise<{ frlId: string }> }) {
  const { frlId } = await params;
  const member = await db.teamMember.findFirst({
    where: { frlId: decodeURIComponent(frlId), status: 'ACTIVE', publicProfile: true },
  });
  if (!member) notFound();

  return (
    <>
      <SiteHeader tagline="Our People" />
      <main className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          {member.photoUrl && <img src={member.photoUrl} alt="" style={{ width: 96, height: 96, borderRadius: 16, objectFit: 'cover', marginBottom: 16 }} />}
          <h1 style={{ fontSize: 34 }}>{member.fullName}</h1>
          <p className="lead" style={{ marginBottom: 16 }}>{member.position}{member.department ? ` · ${member.department}` : ''}</p>
          {member.bio && <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{member.bio}</p>}
          {member.skills.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {member.skills.map((s) => <span key={s} className="pill graypill">{s}</span>)}
            </div>
          )}
          <Link href={`/verify/team/${member.frlId}`} className="btn secondary" style={{ marginTop: 24, display: 'inline-flex' }}>
            Verify this credential
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
