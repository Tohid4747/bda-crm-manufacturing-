import { useAuth } from '../context/AuthContext';

export default function BDADashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">BDA Dashboard</p>
            <h1 className="text-xl font-semibold text-slate-900">
              Welcome, {user?.name}
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <p className="text-slate-600">
            You are signed in as a <strong>BDA</strong>. Your sales and activity
            features will be added in upcoming phases.
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
        </div>
      </main>
    </div>
  );
}
