import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export default function PublicRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (session) {
    const to = location.state?.from ?? '/';
    return <Navigate to={to} replace />;
  }

  return children;
}
