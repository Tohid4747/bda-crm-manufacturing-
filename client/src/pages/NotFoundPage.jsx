import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();

  const homePath = !isAuthenticated
    ? '/login'
    : user?.role === ROLES.ADMIN
      ? '/admin/dashboard'
      : '/bda/dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <p className="text-6xl font-bold text-blue-600">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to={homePath}
          className="inline-flex mt-8 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go to {isAuthenticated ? 'Dashboard' : 'Login'}
        </Link>
      </div>
    </div>
  );
}
