import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import UpcomingFollowUps from '../components/UpcomingFollowUps';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <UpcomingFollowUps />
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            Welcome, <strong>{user?.name}</strong>. Manage your team and leads from
            here.
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex gap-2">
              <dt className="text-slate-500 w-16">Email</dt>
              <dd className="text-slate-900">{user?.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-slate-500 w-16">Role</dt>
              <dd className="text-slate-900">{user?.role}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/admin/leads"
              className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Leads
            </Link>
            <Link
              to="/admin/clients"
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Go to Clients
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
