'use client';

import { incrementDownloadCount } from '@/lib/actions/resources';

export function DownloadLink({ id, fileUrl }: { id: string; fileUrl: string }) {
  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="btn secondary"
      onClick={() => {
        incrementDownloadCount(id);
      }}
    >
      Download
    </a>
  );
}
