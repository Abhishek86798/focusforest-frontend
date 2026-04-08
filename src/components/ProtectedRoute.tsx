import { Navigate, Outlet } from 'react-router-dom';
import PageLoader from './PageLoader';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = () => {
  const user = useAuthStore(state => state.user);
  const isLoading = useAuthStore(state => state.isLoading);

  // Still waiting for checkAuth to finish
  if (isLoading) return <PageLoader />;

  // checkAuth done, no user found → go to login
  if (!user) return <Navigate to="/login" replace />;

  // checkAuth done, user found → render the page
  return <Outlet />;
};

export default ProtectedRoute;
