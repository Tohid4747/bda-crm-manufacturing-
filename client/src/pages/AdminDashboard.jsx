import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';
import { STATUS_CHART_COLORS } from '../constants/chartColors';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import * as dashboardService from '../services/dashboardService';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dashboardService.getAdminDashboard();
      setData(response.data.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pieData =
    data?.leadStatusBreakdown
      ?.filter((item) => item.count > 0)
      .map((item) => ({
        name: item.status,
        value: item.count,
      })) || [];

  return (
    <DashboardLayout title="Admin Dashboard">
      <ErrorAlert
        message={error}
        onDismiss={() => setError('')}
        className="mb-4"
      />

      {loading ? (
        <LoadingSpinner label="Loading dashboard..." />
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Leads" value={data.stats.totalLeads} />
            <StatCard label="Total Clients" value={data.stats.totalClients} />
            <StatCard
              label="BDA Members"
              value={data.stats.totalBdaMembers}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Lead Status Breakdown
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Distribution of leads by pipeline stage
              </p>
              <div className="h-64 sm:h-80 mt-6 min-w-0">
                {pieData.length === 0 ? (
                  <p className="text-sm text-slate-500 flex items-center justify-center h-full">
                    No lead data yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_CHART_COLORS[entry.name] || '#94a3b8'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Monthly Leads Added
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                New leads created over the last 6 months
              </p>
              <div className="h-64 sm:h-80 mt-6 min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyLeadsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      name="Leads"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Top Performing BDAs
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Ranked by closed won leads
              </p>
            </div>
            {data.topPerformingBdas.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-500">
                No closed won leads yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-6 py-3 font-medium">Rank</th>
                      <th className="px-6 py-3 font-medium">BDA Name</th>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium text-right">
                        Closed Won
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.topPerformingBdas.map((bda, index) => (
                      <tr key={bda.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-3 text-slate-500">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-3 font-medium text-slate-900">
                          {bda.name}
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {bda.email}
                        </td>
                        <td className="px-6 py-3 text-right font-semibold text-emerald-700">
                          {bda.closedWon}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
