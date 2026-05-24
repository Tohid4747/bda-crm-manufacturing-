import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/auth';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Loading..." className="min-h-screen" />;
  }

  if (isAuthenticated) {
    const path =
      user.role === ROLES.ADMIN ? '/admin/dashboard' : '/bda/dashboard';
    return <Navigate to={path} replace />;
  }

  return children;
}
