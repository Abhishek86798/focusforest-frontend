import { Navigate, Outlet } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = () => {
  const user = useAuthStore(state => state.user);
  const isInitialized = useAuthStore(state => state.isInitialized);

  // Still waiting for initial auth check to finish
  if (!isInitialized) return <PageLoader />;

  // Auth check done, no user found → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Auth check done, user found → render the page
  return <Outlet />;
};

export default ProtectedRoute;
