import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Genuinely queried, not hardcoded. Will read 0 on a fresh database —
  // that's correct, not a placeholder. As Journal/Programs/etc. models
  // land in later phases, their counts get added here the same way.
  const teamMemberCount = await db.user.count({ where: { status: 'ACTIVE' } });
  const publishedCount = await db.article.count({ where: { status: 'PUBLISHED' } });
  const draftCount = await db.article.count({ where: { status: { in: ['DRAFT', 'IN_REVIEW', 'APPROVED'] } } });
  const scheduledCount = await db.article.count({ where: { status: 'SCHEDULED' } });
  const activeProgramCount = await db.program.count({ where: { status: 'ACTIVE' } });
  const upcomingEventCount = await db.event.count({ where: { status: { in: ['UPCOMING', 'REGISTRATION_OPEN'] } } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="inline-flex bg-frl-green/10 text-frl-green-dark text-xs font-extrabold px-3 py-1.5 rounded-full">
            ADMINISTRATION
          </span>
          <h1 className="text-2xl font-extrabold mt-2">
            Welcome, {session?.user.name?.split(' ')[0]}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Active admin users" value={teamMemberCount} />
        <Stat label="Published posts" value={publishedCount} />
        <Stat label="Drafts & in review" value={draftCount} />
        <Stat label="Scheduled posts" value={scheduledCount} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Active programs" value={activeProgramCount} />
        <Stat label="Upcoming/open events" value={upcomingEventCount} />
      </div>

      <div className="bg-white border border-line rounded-2xl p-6">
        <h2 className="font-bold mb-2">Foundation status</h2>
        <ul className="text-sm text-muted space-y-1 list-disc pl-5">
          <li>Authentication &amp; RBAC — active</li>
          <li>Branding settings — connected to database</li>
          <li>Content modules (Journal, Programs, Activities, Events, Team, Resources) — not yet built</li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-2xl bg-ink text-white p-5">
      <b className="text-3xl block">{value}</b>
      <span className="text-[#b8d2c3] text-xs">{label}</span>
      {note && <p className="text-[10px] text-[#b8d2c3]/70 mt-1">{note}</p>}
    </div>
  );
}
