import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import BDADashboard from './pages/BDADashboard';
import LeadsPage from './pages/LeadsPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import { ROLES } from './constants/auth';

function RootRedirect() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === ROLES.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/bda/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/clients/:id"
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bda/dashboard"
        element={
          <ProtectedRoute allowedRoles={[ROLES.BDA]}>
            <BDADashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bda/leads"
        element={
          <ProtectedRoute allowedRoles={[ROLES.BDA]}>
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bda/clients"
        element={
          <ProtectedRoute allowedRoles={[ROLES.BDA]}>
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bda/clients/:id"
        element={
          <ProtectedRoute allowedRoles={[ROLES.BDA]}>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
