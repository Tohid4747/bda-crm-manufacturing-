import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium ${
        isActive
          ? 'text-blue-600'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </Link>
  );
}

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const leadsPath = isAdmin ? '/admin/leads' : '/bda/leads';
  const clientsPath = isAdmin ? '/admin/clients' : '/bda/clients';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/bda/dashboard';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-medium">{title}</p>
            <h1 className="text-xl font-semibold text-slate-900">
              {user?.name}
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <NavLink to={dashboardPath}>Dashboard</NavLink>
            <NavLink to={leadsPath}>Leads</NavLink>
            <NavLink to={clientsPath}>Clients</NavLink>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
