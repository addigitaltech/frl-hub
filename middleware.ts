import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Blanket protection for everything under /admin (except the login page
// itself and its form-submission API route). Page- and action-level
// capability checks (lib/rbac.ts) still apply on top of this — this
// middleware only proves "is signed in", not "is allowed to do X".
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: '/admin/login' },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/admin/((?!login).*)'],
};
