import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
// Wraps any page that requires authentication.
// - While auth is loading → show a minimal loading screen
// - If not authenticated → redirect to /login
// - If authenticated → render children
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#F2F2F2',
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '14px',
          color: 'rgba(26,26,26,0.4)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
