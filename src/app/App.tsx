import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { Landing } from './pages/Landing';
import { OrgDashboard } from './pages/OrgDashboard';
import { AmbassadorDashboard } from './pages/AmbassadorDashboard';

const ProtectedRoute = ({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole: 'organization' | 'ambassador';
}) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={user.role === 'organization' ? '/org/dashboard' : '/ambassador/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          className: 'my-toast',
          duration: 4000,
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/org/dashboard"
            element={
              <ProtectedRoute requiredRole="organization">
                <OrgDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambassador/dashboard"
            element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}