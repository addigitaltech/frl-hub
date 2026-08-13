'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="block mt-6 text-[#b8d2c3] hover:text-white text-sm"
    >
      ← Sign out
    </button>
  );
}
