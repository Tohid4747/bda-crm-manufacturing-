import { ACTIVITY_TYPE_COLORS } from '../constants/activities';

export default function ActivityTypeBadge({ type }) {
  const colorClass =
    ACTIVITY_TYPE_COLORS[type] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {type}
    </span>
  );
}
