import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import * as teamService from '../services/teamService';

function formatRate(rate) {
  return `${rate}%`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TeamMemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deactivating, setDeactivating] = useState(false);

  const fetchPerformance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teamService.getMemberPerformance(id);
      setData(response.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load member details'));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const handleDeactivate = async () => {
    if (!data?.member?.isActive) return;
    if (
      !window.confirm(
        `Deactivate ${data.member.name}? They will no longer be able to sign in.`
      )
    ) {
      return;
    }

    setDeactivating(true);
    setError('');
    try {
      await teamService.deactivateMember(id);
      await fetchPerformance();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to deactivate member'));
    } finally {
      setDeactivating(false);
    }
  };

  const member = data?.member;

  return (
    <DashboardLayout title="Admin — Team Member">
      <Link
        to="/admin/team"
        className="inline-flex text-sm text-blue-600 hover:underline mb-6"
      >
        ← Back to Team
      </Link>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      {loading ? (
        <LoadingSpinner label="Loading member..." />
      ) : member ? (
        <div className="space-y-6">

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {member.name}
                  </h2>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      member.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{member.email}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Member since {formatDate(member.createdAt)}
                </p>
              </div>

              {member.isActive && (
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  {deactivating ? 'Deactivating...' : 'Deactivate Member'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Total Leads</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">
                  {member.totalLeads}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Closed Deals</p>
                <p className="text-2xl font-semibold text-emerald-700 mt-1">
                  {member.closedDeals}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Conversion Rate</p>
                <p className="text-2xl font-semibold text-blue-700 mt-1">
                  {formatRate(member.conversionRate)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Closed won ÷ total assigned leads
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Pipeline Breakdown
              </h3>
              {data.statusBreakdown.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">No leads assigned.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.statusBreakdown.map((item) => (
                    <li
                      key={item.status}
                      className="flex items-center justify-between text-sm"
                    >
                      <StatusBadge status={item.status} />
                      <span className="font-medium text-slate-900">
                        {item.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Leads
              </h3>
              {data.recentLeads.length === 0 ? (
                <p className="text-sm text-slate-500 mt-4">No leads assigned.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100">
                  {data.recentLeads.map((lead) => (
                    <li key={lead.id} className="py-3 first:pt-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/leads/${lead.id}`)}
                        className="text-left w-full hover:opacity-80"
                      >
                        <p className="font-medium text-slate-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-500">{lead.company}</p>
                        <div className="mt-2">
                          <StatusBadge status={lead.status} />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
