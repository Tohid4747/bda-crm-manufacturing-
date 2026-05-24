import { STATUS_COLORS } from '../constants/leads';

export default function StatusBadge({ status }) {
  const colorClass =
    STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
}
