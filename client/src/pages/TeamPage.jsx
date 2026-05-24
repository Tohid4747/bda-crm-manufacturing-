import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import * as teamService from '../services/teamService';

function formatRate(rate) {
  return `${rate}%`;
}

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teamService.getTeamMembers();
      setMembers(response.data.data.members);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load team members'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <DashboardLayout title="Admin — Team Management">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
          Team
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Manage BDA members and view their performance
        </p>
      </div>

      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading team..." />
        ) : members.length === 0 ? (
          <p className="p-8 text-center text-slate-600">No BDA members found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Total Leads
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Closed Deals
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    Conversion
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={`/admin/team/${member.id}`}
                        className="text-slate-900 hover:text-blue-600"
                      >
                        {member.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {member.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          member.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {member.totalLeads}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                      {member.closedDeals}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatRate(member.conversionRate)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/team/${member.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
