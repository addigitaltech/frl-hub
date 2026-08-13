'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  transitionArticle,
  scheduleArticle,
  permanentlyDeleteArticle,
} from '@/lib/actions/journal';

type Perms = {
  canSubmit: boolean;
  canReview: boolean;
  canApprove: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export function WorkflowActions({ articleId, status, perms }: { articleId: string; status: string; perms: Perms }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Action failed.');
      }
    });
  }

  const buttons: React.ReactNode[] = [];

  if (status === 'DRAFT' && perms.canSubmit) {
    buttons.push(
      <Btn key="submit" onClick={() => run(() => transitionArticle(articleId, 'submit'))} label="Submit for review" />
    );
  }
  if (status === 'IN_REVIEW' && perms.canReview) {
    buttons.push(
      <Btn key="changes" variant="secondary" onClick={() => run(() => transitionArticle(articleId, 'requestChanges'))} label="Request changes" />
    );
  }
  if (status === 'IN_REVIEW' && perms.canApprove) {
    buttons.push(<Btn key="approve" onClick={() => run(() => transitionArticle(articleId, 'approve'))} label="Approve" />);
  }
  if (status === 'APPROVED' && perms.canPublish) {
    buttons.push(<Btn key="publish" onClick={() => run(() => transitionArticle(articleId, 'publishNow'))} label="Publish now" />);
    buttons.push(<Btn key="schedule" variant="secondary" onClick={() => setShowSchedule(true)} label="Schedule…" />);
  }
  if (status === 'SCHEDULED' && perms.canPublish) {
    buttons.push(<Btn key="publish-now" onClick={() => run(() => transitionArticle(articleId, 'publishNow'))} label="Publish now instead" />);
  }
  if (['DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED'].includes(status) && perms.canDelete) {
    buttons.push(<Btn key="archive" variant="secondary" onClick={() => run(() => transitionArticle(articleId, 'archive'))} label="Archive" />);
  }
  if (status !== 'TRASHED' && perms.canDelete) {
    buttons.push(<Btn key="trash" variant="danger" onClick={() => run(() => transitionArticle(articleId, 'trash'))} label="Move to trash" />);
  }
  if (['TRASHED', 'ARCHIVED'].includes(status) && perms.canDelete) {
    buttons.push(<Btn key="restore" variant="secondary" onClick={() => run(() => transitionArticle(articleId, 'restore'))} label="Restore to draft" />);
  }
  if (status === 'TRASHED' && perms.canDelete) {
    buttons.push(
      <Btn
        key="delete"
        variant="danger"
        onClick={() => {
          if (window.confirm('Permanently delete this article? This cannot be undone.')) {
            run(() => permanentlyDeleteArticle(articleId));
          }
        }}
        label="Delete permanently"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">{buttons}</div>
      {pending && <p className="text-xs text-muted mt-2">Working…</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {showSchedule && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="border border-line rounded-lg px-3 py-2 text-sm"
          />
          <Btn
            label="Confirm schedule"
            onClick={() =>
              run(async () => {
                await scheduleArticle(articleId, new Date(scheduleAt).toISOString());
                setShowSchedule(false);
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function Btn({
  label,
  onClick,
  variant = 'primary',
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const cls =
    variant === 'primary'
      ? 'btn primary'
      : variant === 'danger'
        ? 'bg-red-600 text-white font-bold rounded-lg px-4 py-2 text-sm'
        : 'btn secondary';
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  );
}
