import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';
import * as activityService from '../services/activityService';

function NavLink({ to, children, matchPrefix = false, onClick, badge }) {
  const location = useLocation();
  const isActive = matchPrefix
    ? location.pathname === to || location.pathname.startsWith(`${to}/`)
    : location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {children}
      {badge > 0 && (
        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

export default function DashboardLayout({ title, children }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const leadsPath = isAdmin ? '/admin/leads' : '/bda/leads';
  const clientsPath = isAdmin ? '/admin/clients' : '/bda/clients';
  const dashboardPath = isAdmin ? '/admin/dashboard' : '/bda/dashboard';
  const teamPath = '/admin/team';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dueTodayCount, setDueTodayCount] = useState(0);

  const fetchDueTodayCount = useCallback(async () => {
    try {
      const response = await activityService.getDueTodayCount();
      setDueTodayCount(response.data.data.count);
    } catch {
      setDueTodayCount(0);
    }
  }, []);

  useEffect(() => {
    fetchDueTodayCount();
    const interval = setInterval(fetchDueTodayCount, 60000);
    return () => clearInterval(interval);
  }, [fetchDueTodayCount]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinks = (
    <>
      <NavLink to={dashboardPath} onClick={closeMobileMenu}>
        Dashboard
      </NavLink>
      <NavLink to={leadsPath} onClick={closeMobileMenu}>
        Leads
      </NavLink>
      <NavLink to={clientsPath} onClick={closeMobileMenu}>
        Clients
      </NavLink>
      {isAdmin && (
        <NavLink to={teamPath} matchPrefix onClick={closeMobileMenu}>
          Team
        </NavLink>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">
                {title}
              </p>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">
                {user?.name}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {dueTodayCount > 0 && (
                <Link
                  to={dashboardPath}
                  className="relative flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 sm:px-3"
                  title={`${dueTodayCount} follow-up(s) due today`}
                >
                  <span className="hidden sm:inline">Follow-ups</span>
                  <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {dueTodayCount > 99 ? '99+' : dueTodayCount}
                  </span>
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="hidden sm:inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="inline-flex sm:hidden items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-700"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-1 mt-4 pt-4 border-t border-slate-100">
            {navLinks}
          </nav>
        </div>

        {mobileMenuOpen && (
          <nav className="sm:hidden border-t border-slate-200 px-4 py-3 flex flex-col gap-1">
            {navLinks}
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                logout();
              }}
              className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 text-left hover:bg-slate-50"
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
