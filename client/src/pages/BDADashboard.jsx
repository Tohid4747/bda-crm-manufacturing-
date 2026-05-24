import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import UpcomingFollowUps from '../components/UpcomingFollowUps';
import { STATUS_CHART_COLORS } from '../constants/chartColors';
import * as dashboardService from '../services/dashboardService';

export default function BDADashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dashboardService.getBdaDashboard();
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pipelineData =
    data?.pipelineStatus
      ?.filter((item) => item.count > 0)
      .map((item) => ({
        status: item.status,
        count: item.count,
      })) || [];

  return (
    <DashboardLayout title="BDA Dashboard">
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-slate-600">Loading dashboard...</p>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="My Total Leads" value={data.stats.myTotalLeads} />
            <StatCard
              label="My Closed Deals"
              value={data.stats.myClosedDeals}
              subtext="Leads with Closed Won status"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                My Pipeline
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Leads by status in your pipeline
              </p>
              <div className="h-80 mt-6">
                {pipelineData.length === 0 ? (
                  <p className="text-sm text-slate-500 flex items-center justify-center h-full">
                    No leads in your pipeline yet
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={pipelineData}
                      layout="vertical"
                      margin={{ left: 20, right: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="status"
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="count" name="Leads" radius={[0, 4, 4, 0]}>
                        {pipelineData.map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={
                              STATUS_CHART_COLORS[entry.status] || '#94a3b8'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <UpcomingFollowUps />
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
