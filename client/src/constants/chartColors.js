import { LEAD_STATUSES } from './leads';

export const STATUS_CHART_COLORS = {
  New: '#64748b',
  Contacted: '#3b82f6',
  Qualified: '#6366f1',
  Proposal: '#f59e0b',
  'Closed Won': '#10b981',
  'Closed Lost': '#ef4444',
};

export const STATUS_CHART_COLOR_LIST = LEAD_STATUSES.map(
  (status) => STATUS_CHART_COLORS[status]
);
