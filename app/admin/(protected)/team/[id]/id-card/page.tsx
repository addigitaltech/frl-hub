import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/get-settings';
import { verificationQrDataUrl } from '@/lib/qr';
import { PrintButton } from './print-button';

export default async function IdCardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');
  if (!hasPermission(session.user.role, 'team.manage')) {
    return <p className="text-sm text-muted">You do not have permission to generate ID cards.</p>;
  }

  const { id } = await params;
  const member = await db.teamMember.findUnique({ where: { id } });
  if (!member) notFound();
  if (member.status !== 'ACTIVE') {
    return <p className="text-sm text-muted">Only ACTIVE members can have an ID card generated. Update this member's status first.</p>;
  }

  const settings = await getSettings();
  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000').host;
  const baseUrl = `${proto}://${host}`;
  const qr = await verificationQrDataUrl(member.frlId, baseUrl);

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">ID Card — {member.fullName}</h1>
        <PrintButton />
      </div>

      <div className="id-card-sheet">
        {/* FRONT */}
        <div className="id-card">
          <img src={settings.logoPrimaryUrl || '/frl-logo.jpg'} alt="" className="id-card-logo" />
          {member.photoUrl && <img src={member.photoUrl} alt="" className="id-card-photo" />}
          <h2>{member.fullName}</h2>
          <p className="id-card-role">{member.position ?? 'Team Member'}</p>
          <p className="id-card-id">{member.frlId}</p>
          <img src={qr} alt="Verification QR code" className="id-card-qr" />
        </div>

        {/* BACK */}
        <div className="id-card id-card-back">
          <h3>{settings.orgName}</h3>
          <p>{settings.tagline}</p>
          <p>Verify this credential by scanning the QR code on the front, or visiting:</p>
          <p className="id-card-url">{baseUrl}/verify/team/{member.frlId}</p>
          <p className="id-card-fine">
            This card remains the property of {settings.orgName}. If found, please contact the
            organisation using the details on our website. This card is valid only while the
            holder's status is shown as active on the verification page above.
          </p>
        </div>
      </div>
    </div>
  );
}
