import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

/**
 * A hook that redirects to /login if user is not authenticated.
 * Use at the top of any protected page.
 *
 * Returns { user, isLoading } for convenience.
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}
