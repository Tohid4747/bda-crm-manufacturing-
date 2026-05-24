import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

export default function BDADashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout title="BDA Dashboard">
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <p className="text-slate-600">
          Welcome, <strong>{user?.name}</strong>. View and update leads assigned to
          you.
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
        <Link
          to="/bda/leads"
          className="inline-flex mt-8 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to My Leads
        </Link>
      </div>
    </DashboardLayout>
  );
}
