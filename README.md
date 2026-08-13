# FRL Hub

Production-track CMS/platform for FutureReadiness Lab. Built in phases on
top of the original V1 visual design — see "Build phases" below for what's
real versus not-yet-built.

## Status: this codebase has NOT been run

This was authored in a sandboxed environment with no network access, so
`npm install` / `prisma migrate` / `next dev` have not actually been
executed against it. Treat it as carefully written and internally
consistent, not as verified-working. Run the Quick start below and fix
whatever surfaces — expect a few small issues (dependency version drift,
a missed import) rather than structural ones.

## Build phases

**Phase 1 — Foundation (done)**
- Auth (NextAuth, Credentials + bcrypt, JWT sessions), `/admin/**` protected by middleware
- RBAC: role → capability matrix in `lib/rbac.ts`, enforced inside every server action, not just hidden in the UI
- `Settings` (branding: logo, favicon, colors, tagline, timezone) — editable at `/admin/settings/branding`, read by the whole site via `lib/get-settings.ts`
- `SocialLink`, `FeatureFlag`, `AuditLog` models
- Public header/footer now read branding + social links from the DB instead of six copies of hardcoded markup

**Phase 2 — FRL Journal (done)**
- Full workflow: Draft → In review → Approved → Scheduled → Published → Archived → Trashed → permanently deleted, enforced in `lib/actions/journal.ts`
- Tiptap editor (`components/tiptap-editor.tsx`) with headings, colour, highlight, alignment, lists, links, images, YouTube embeds, tables, code blocks, undo/redo
- Version history snapshot on every save (`ArticleVersion`)
- Categories/tags (`/admin/journal/taxonomy`)
- Scheduling via `Article.publishAt` + `app/api/cron/publish-scheduled` (see Scheduling below)
- Public reading path: `/blog` (list) and `/blog/[slug]` (article), SEO metadata, view counts
- Homepage "Latest from FRL Journal" now pulls real published articles

**Phase 3 — Programs, Activities, Events (done)**
- `Program`, `Activity`, `Event` models with their own status enums; stopping a program does not cascade-delete its activities/events, per spec section 11
- Admin CRUD for all three at `/admin/programs`, `/admin/activities`, `/admin/events` — RBAC-gated (`programs.manage`, `activities.manage`, `events.manage`)
- Status changes are a direct dropdown-and-confirm (no review chain like Journal — that's intentional, these roles aren't editorial)
- Public pages: `/programs` + `/programs/[slug]`, `/activities` + `/activities/[slug]`, `/events` + `/events/[slug]` (new — didn't exist even as a placeholder before)
- Scope cut: Program/Activity/Event descriptions are plain text, not the Tiptap rich-text used in Journal — swap the field for a contentJson/contentHtml pair later if rich formatting turns out to matter here

**Phase 4 — Team & Digital ID, and the remaining site modules (done)**
- `TeamMember` model with sequential FRL IDs (`FRL-TEAM-0001`, ...), status workflow (PENDING → ACTIVE/SUSPENDED/DEACTIVATED/ARCHIVED)
- QR-backed Verification Centre: `/verify` (lookup form) → `/verify/team/[frlId]` resolves live against the DB, so a status change is reflected immediately without reissuing a card. The QR encodes only the verification URL, never member data — any phone camera already "scans" it natively, so there's no separate in-app scanner
- Printable ID card at `/admin/team/[id]/id-card` — front/back layout, uses the browser's native print-to-PDF rather than a server PDF-rendering dependency (documented trade-off in the code)
- **Resources** (`/admin/resources`, public `/resources`) with real download-count tracking
- **Opportunities** (`/admin/opportunities`, public `/opportunities`) with deadlines and featured flag
- **FAQ** (`/admin/faq`, public `/faq`) with search/accordion and a WhatsApp CTA driven by `Settings`
- **Testimonials** (`/admin/testimonials`) with approve/reject, featured flag
- **Impact metrics** (`/admin/impact`) — the homepage's impact stats are now real DB rows, not hardcoded `0+`
- **Enquiries** — public `/contact` form (with a honeypot spam guard) + `/admin/enquiries` queue with status and assignment
- **School Partnerships** — public `/partner` form + `/admin/partnerships` pipeline
- **Team Applications** — public `/get-involved` form + `/admin/team-applications`, including a deliberately manual "Add to team" action that turns an approved application into a real `TeamMember` (never automatic)
- **Newsletter** — subscribe/confirm/unsubscribe flow (`/newsletter/confirm/[token]`, `/newsletter/unsubscribe/[token]`) and `/admin/newsletter` campaign drafts. Honestly incomplete: no email provider is wired up (`EMAIL_PROVIDER_API_KEY` is unset), so subscriber rows and campaign records are real but nothing is actually delivered yet — the admin UI says so directly rather than pretending otherwise
- **WhatsApp settings** — Level 1 (public `wa.me` chat link, admin-configurable) is live; Level 2 (Business Cloud API for automated replies/webhooks) is explicitly marked not built
- **Feature Flags** (`/admin/feature-flags`) — toggle list seeded with `volunteers`, `push_notifications`, `comments`, so those modules have a real on/off switch ready for when they're built

**Not yet built:** Volunteer system, push notifications, WhatsApp Cloud API (Level 2), media library, global full-text search, analytics, content calendar view, transactional email delivery.

## Quick start

```bash
cp .env.example .env        # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
npm install
npx prisma migrate dev --name init
SEED_ADMIN_EMAIL=you@frl.org SEED_ADMIN_PASSWORD=<12+ chars> npm run prisma:seed
npm run dev
```

Sign in at `/admin/login` with the seeded credentials, then go to
`/admin/settings/branding` to set the real logo/colors — this replaces
the fallback `/frl-logo.jpg` asset everywhere.

## Scheduling (auto-publish)

`app/api/cron/publish-scheduled` publishes any `SCHEDULED` article whose
`publishAt` has passed. It expects an `x-cron-secret` header matching
`CRON_SECRET` and is meant to be called by an external scheduler (Vercel
Cron, GitHub Actions cron, a plain crontab hitting the URL) every few
minutes — it is not self-triggering. Every run writes a `ScheduledJobLog`
row, success or failure, so a failed publish is auditable instead of
silent.

## Deployment readiness (Vercel / Render / GitHub)

**Not deployment-ready yet.** Concretely:

1. **This code has never been built or run.** No `npm install`, no `next build`, no `tsc --noEmit` has executed against it anywhere in its history — do that locally first and fix whatever surfaces before pushing to GitHub.
2. **File uploads will break on Vercel.** `lib/actions/branding.ts` writes to `/public/uploads`, which is read-only/ephemeral on Vercel's serverless runtime. Either deploy on Render (which supports a persistent disk) until object storage is wired in, or swap `saveUpload()` for S3/R2/Spaces before using Vercel.
3. **Provision Postgres separately** — Vercel and Render don't include it. Neon, Supabase, or Render's own Postgres add-on all work; put the connection string in `DATABASE_URL`.
4. **Set real env vars on the host**, not just `.env` locally: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your deployed domain), `CRON_SECRET`.
5. **Wire the cron** — Vercel Cron (`vercel.json`) or a Render Cron Job, hitting `POST /api/cron/publish-scheduled` with header `x-cron-secret: <CRON_SECRET>` every few minutes. Nothing publishes scheduled articles without this.
6. **Run the seed script once** against the production database (`SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run prisma:seed`) to create the first SUPER_ADMIN — do this from a secure shell, not by committing credentials.
7. Most of the spec (Team/ID, Resources, Newsletter, WhatsApp, etc.) isn't built — fine for a staging/testing deploy, not for a public launch.

For GitHub: nothing here depends on GitHub specifically — push the repo and connect it via Vercel's or Render's Git integration; each builds from the same `package.json` / `prisma` setup.

## Before production launch

- **File storage**: `lib/actions/branding.ts` currently saves logo/favicon uploads to `/public/uploads`, which does not persist on most serverless hosts. Swap `saveUpload()` for an S3-compatible client using the `STORAGE_*` env vars already stubbed in `.env.example`.
- **Email/WhatsApp/Push**: env vars are stubbed in `.env.example`; no provider is wired up yet.
- Run `npm run lint` and `npx tsc --noEmit` — neither has been run in this environment.

## Stack

Next.js (App Router) + TypeScript + Tailwind + Prisma/PostgreSQL +
NextAuth + Zod + Tiptap.
