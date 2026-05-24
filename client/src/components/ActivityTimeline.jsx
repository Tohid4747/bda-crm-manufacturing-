import ActivityTypeBadge from './ActivityTypeBadge';
import LoadingSpinner from './LoadingSpinner';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getFollowUpLabel(followUpDate) {
  if (!followUpDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUp = new Date(followUpDate);
  followUp.setHours(0, 0, 0, 0);

  const diffDays = Math.round((followUp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Overdue', className: 'text-red-600' };
  if (diffDays === 0) return { text: 'Due today', className: 'text-amber-600' };
  return { text: `Follow-up: ${formatDate(followUpDate)}`, className: 'text-slate-500' };
}

export default function ActivityTimeline({ activities, loading }) {
  if (loading) {
    return <LoadingSpinner label="Loading activities..." className="py-6" />;
  }

  if (!activities.length) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No activities logged yet. Log your first call, email, or meeting above.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-slate-200 ml-3 space-y-6">
      {activities.map((activity) => {
        const followUp = getFollowUpLabel(activity.followUpDate);

        return (
          <li key={activity.id} className="ml-6">
            <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-1 ring-slate-200" />
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <ActivityTypeBadge type={activity.type} />
                <time className="text-xs text-slate-500">
                  {formatDateTime(activity.createdAt)}
                </time>
              </div>

              {activity.notes && (
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {activity.notes}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>By {activity.createdBy?.name || 'Unknown'}</span>
                {followUp && (
                  <span className={followUp.className}>{followUp.text}</span>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
