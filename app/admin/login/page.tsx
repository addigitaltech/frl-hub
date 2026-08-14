'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Incorrect email or password.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <Image src="/frl-logo.jpg" alt="FRL" width={40} height={40} className="rounded-lg" />
          <div>
            <p className="font-extrabold leading-tight">FRL Hub</p>
            <p className="text-xs text-muted">Administration</p>
          </div>
        </div>

        <label className="block text-sm font-bold mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-4"
          autoComplete="username"
        />

        <label className="block text-sm font-bold mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-4"
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-frl-green text-white font-bold rounded-lg py-2.5 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <Link
          href="/"
          className="block text-center text-sm text-muted hover:text-frl-green mt-4"
        >
          ← Back to website
        </Link>
      </form>
    </main>
  );
}
