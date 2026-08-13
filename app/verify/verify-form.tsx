'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function VerifyForm() {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        router.push(`/verify/team/${encodeURIComponent(value.trim())}`);
      }}
    >
      <div className="field" style={{ marginTop: 20 }}>
        <label>Credential ID</label>
        <input placeholder="e.g. FRL-TEAM-0001" value={value} onChange={(e) => setValue(e.target.value)} required />
      </div>
      <button className="btn primary" style={{ marginTop: 15 }} type="submit">
        Verify credential
      </button>
    </form>
  );
}
