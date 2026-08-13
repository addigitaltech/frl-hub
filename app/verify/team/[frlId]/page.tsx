import { db } from '@/lib/db';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const STATUS_LABEL: Record<string, { label: string; ok: boolean }> = {
  ACTIVE: { label: 'Valid — active team member', ok: true },
  PENDING: { label: 'Pending — not yet an active team member', ok: false },
  SUSPENDED: { label: 'Suspended — not currently valid', ok: false },
  DEACTIVATED: { label: 'Deactivated — no longer valid', ok: false },
  ARCHIVED: { label: 'Archived — no longer valid', ok: false },
};

export default async function VerifyTeamMember({ params }: { params: Promise<{ frlId: string }> }) {
  const { frlId } = await params;
  const member = await db.teamMember.findUnique({ where: { frlId: decodeURIComponent(frlId) } });

  const status = member ? STATUS_LABEL[member.status] : null;

  return (
    <>
      <SiteHeader tagline="Verification Centre" />
      <main className="verify">
        <div className="card" style={{ marginTop: 25 }}>
          <span className="eyebrow">FRL VERIFICATION CENTRE</span>
          {!member ? (
            <>
              <h1>No credential found</h1>
              <p className="lead">
                We couldn&apos;t find an FRL credential matching <code>{frlId}</code>. Double-check the ID or QR code.
              </p>
            </>
          ) : (
            <div className="verify-card" style={{ marginTop: 15 }}>
              {member.photoUrl && <img src={member.photoUrl} alt="" />}
              <div>
                <span className={`check`} style={{ background: status?.ok ? undefined : '#fee2e2', color: status?.ok ? undefined : '#b91c1c' }}>
                  {status?.label}
                </span>
                <h2>{member.fullName}</h2>
                <p>{member.position ?? 'Team Member'} · FRL Team Member</p>
                <p style={{ fontFamily: 'monospace', fontWeight: 800 }}>{member.frlId}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
