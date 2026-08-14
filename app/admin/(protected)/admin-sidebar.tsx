'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignOutButton } from './sign-out-button';

type NavItem = { href: string; label: string };

export function AdminSidebar({
  navItems,
  user,
}: {
  navItems: NavItem[];
  user: { name: string; role: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile-only top bar with hamburger trigger. Hidden on desktop,
          where the sidebar is always visible instead. */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-ink text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Image src="/frl-logo.jpg" alt="FRL" width={28} height={28} className="rounded bg-white" />
          <span className="font-extrabold text-sm">FRL Hub Admin</span>
        </div>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="text-xl leading-none px-2 py-1"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Backdrop — mobile only, closes the drawer on tap-outside. */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          bg-ink text-white p-6 overflow-y-auto
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:static md:translate-x-0 md:w-auto md:h-screen md:sticky md:top-0
        `}
      >
        <Image src="/frl-logo.jpg" alt="FRL" width={44} height={44} className="rounded-lg bg-white" />
        <h3 className="mt-3 font-extrabold">FRL Hub</h3>
        <p className="text-xs text-[#b8d2c3]">Administration</p>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-[#c9ddd1] hover:bg-[#173624] hover:text-white text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-white/10 text-xs text-[#b8d2c3]">
          <p className="font-bold text-white">{user.name}</p>
          <p>{user.role.replace(/_/g, ' ')}</p>
        </div>

        <Link href="/" className="block mt-3 text-[#b8d2c3] hover:text-white text-sm">
          ← View website
        </Link>
        <SignOutButton />
      </aside>
    </>
  );
}
