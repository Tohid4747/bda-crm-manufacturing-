import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    const path =
      user.role === ROLES.ADMIN ? '/admin/dashboard' : '/bda/dashboard';
    return <Navigate to={path} replace />;
  }

  return children;
}
