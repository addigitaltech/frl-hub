import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Blanket protection for everything under /admin. /admin/login is
// explicitly allowed through in the authorized() callback below rather
// than excluded via the matcher pattern — matcher patterns don't
// reliably support negative-lookahead regex, so excluding a subpath
// that way can silently fail and protect the login page itself,
// creating a redirect loop (session-less visit -> redirect to
// /admin/login -> still session-less -> redirect again).
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: { signIn: '/admin/login' },
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname === '/admin/login') return true;
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
