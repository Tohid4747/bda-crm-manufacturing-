import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ActivityTypeBadge from './ActivityTypeBadge';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import * as activityService from '../services/activityService';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDueLabel(followUpDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUp = new Date(followUpDate);
  followUp.setHours(0, 0, 0, 0);
  const diffDays = Math.round((followUp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      className: 'text-red-600 font-medium',
    };
  }
  if (diffDays === 0) {
    return { text: 'Due today', className: 'text-amber-600 font-medium' };
  }
  return { text: formatDate(followUpDate), className: 'text-slate-600' };
}

export default function UpcomingFollowUps() {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const leadsBase = isAdmin ? '/admin/leads' : '/bda/leads';

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUpcoming = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await activityService.getUpcomingActivities();
      setActivities(response.data.data.activities);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load upcoming follow-ups'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Upcoming Follow-ups
      </h2>
      <p className="text-sm text-slate-600 mt-1">
        Activities due today or overdue
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-600">Loading...</p>
      ) : activities.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No overdue or due-today follow-ups. You&apos;re all caught up.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {activities.map((activity) => {
            const due = getDueLabel(activity.followUpDate);
            const leadId = activity.lead?.id || activity.leadId;

            return (
              <li key={activity.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      to={`${leadsBase}/${leadId}`}
                      className="font-medium text-slate-900 hover:text-blue-600"
                    >
                      {activity.lead?.name || 'Lead'}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activity.lead?.company}
                    </p>
                  </div>
                  <ActivityTypeBadge type={activity.type} />
                </div>
                {activity.notes && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {activity.notes}
                  </p>
                )}
                <p className={`mt-2 text-xs ${due.className}`}>{due.text}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
