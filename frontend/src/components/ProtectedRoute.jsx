import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { useAuth } from '../context/AuthContext';
import SiteLoader from './SiteLoader';

// Protected Route for User Authentication
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useUserAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0c0a14] transition-colors">
        <SiteLoader message="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Protected Route for Admin Authentication
export const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Guest Route - Only accessible when NOT logged in
export const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useUserAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
