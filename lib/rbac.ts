import { Role } from '@prisma/client';

// Every capability an admin action can require. Pages hide controls a role
// can't use, but the *authoritative* check always happens here, on the
// server — in server actions / route handlers — never only in the UI.
export type Capability =
  | 'settings.branding.manage'
  | 'settings.security.manage'
  | 'users.manage'
  | 'journal.create'
  | 'journal.edit.own'
  | 'journal.edit.any'
  | 'journal.review'
  | 'journal.approve'
  | 'journal.publish'
  | 'journal.delete'
  | 'programs.manage'
  | 'activities.manage'
  | 'events.manage'
  | 'team.manage'
  | 'team_applications.manage'
  | 'newsletter.manage'
  | 'notifications.manage'
  | 'social.manage'
  | 'whatsapp.manage'
  | 'feature_flags.manage'
  | 'resources.manage'
  | 'opportunities.manage'
  | 'faq.manage'
  | 'testimonials.manage'
  | 'impact.manage'
  | 'enquiries.manage'
  | 'partnerships.manage';

const ALL: Capability[] = [
  'settings.branding.manage',
  'settings.security.manage',
  'users.manage',
  'journal.create',
  'journal.edit.own',
  'journal.edit.any',
  'journal.review',
  'journal.approve',
  'journal.publish',
  'journal.delete',
  'programs.manage',
  'activities.manage',
  'events.manage',
  'team.manage',
  'team_applications.manage',
  'newsletter.manage',
  'notifications.manage',
  'social.manage',
  'whatsapp.manage',
  'feature_flags.manage',
  'resources.manage',
  'opportunities.manage',
  'faq.manage',
  'testimonials.manage',
  'impact.manage',
  'enquiries.manage',
  'partnerships.manage',
];

// Role -> capabilities. This is the single source of truth for who can do
// what. Changing an admin's permissions means changing this table, not
// hunting through pages for hidden buttons.
//
// Mapping notes for capabilities the spec doesn't pin to a specific role
// (resources, opportunities, FAQ, testimonials, impact, enquiries,
// partnerships): assigned to the closest-fitting existing role below.
// This is a reasonable default, not a spec requirement — adjust freely.
export const ROLE_PERMISSIONS: Record<Role, Capability[]> = {
  SUPER_ADMIN: ALL,

  MANAGING_EDITOR: [
    'journal.create',
    'journal.edit.own',
    'journal.edit.any',
    'journal.review',
    'journal.approve',
    'journal.publish',
    'journal.delete',
    'resources.manage',
    'faq.manage',
  ],

  CONTENT_EDITOR: ['journal.create', 'journal.edit.own'],

  PROGRAM_MANAGER: [
    'programs.manage',
    'activities.manage',
    'opportunities.manage',
    'partnerships.manage',
  ],

  EVENT_MANAGER: ['events.manage'],

  TEAM_MANAGER: ['team.manage', 'team_applications.manage'],

  COMMUNICATIONS_MANAGER: [
    'newsletter.manage',
    'notifications.manage',
    'social.manage',
    'whatsapp.manage',
    'testimonials.manage',
    'impact.manage',
    'enquiries.manage',
  ],
};

export function hasPermission(role: Role | undefined | null, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(capability) ?? false;
}

export class ForbiddenError extends Error {
  constructor(capability: Capability) {
    super(`Forbidden: missing capability "${capability}"`);
    this.name = 'ForbiddenError';
  }
}

// Call this at the top of every server action / route handler that
// mutates data. Throwing here — not just hiding a button — is what makes
// RBAC real instead of cosmetic.
export function requirePermission(role: Role | undefined | null, capability: Capability) {
  if (!hasPermission(role, capability)) {
    throw new ForbiddenError(capability);
  }
}
