import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// ── Pages ─────────────────────────────────────────────────────────────────────
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import DashboardPage      from './pages/DashboardPage';
import CalendarPage       from './pages/CalendarPage';
import StatsDashboardPage from './pages/StatsDashboardPage';
import GroupsPage         from './pages/GroupsPage';
import LeaderboardPage    from './pages/LeaderboardPage';
import ZenModePage        from './pages/ZenModePage';
import ProfilePage        from './pages/ProfilePage';
import NotFoundPage       from './pages/NotFoundPage';
import AuthCallbackPage   from './pages/AuthCallbackPage';
import {
  SessionPage,
} from './pages/StubPages';

// ── Error Fallback ────────────────────────────────────────────────────────────
function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  const navigate = useNavigate();

  const handleRecover = () => {
    resetErrorBoundary();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: '#F2F2F2', padding: '20px', textAlign: 'center' }}>
      <div style={{ background: '#FFFFFF', border: '2px solid #1A1A1A', 
        boxShadow: '4px 4px 0px 0px rgba(26,26,26,1)', borderRadius: '8px', 
        padding: '48px 32px', maxWidth: '500px' }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, 
          fontSize: '24px', color: '#1A1A1A', marginBottom: '16px' }}>
          Something went wrong
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', 
          color: 'rgba(26,26,26,0.6)', marginBottom: '24px' }}>
          The app encountered an unexpected error.
        </p>
        <button onClick={handleRecover} 
          className="transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ padding: '12px 24px', 
          background: '#006D37', color: '#FAFAFA', border: '2px solid #1A1A1A',
          boxShadow: '4px 4px 0px 0px rgba(26,26,26,1)', borderRadius: '4px',
          fontFamily: "'Space Grotesk', sans-serif", fontSize: '16px', 
          fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
          Recover Session
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const hasChecked = useRef(false);

  // Restore session from httpOnly cookie on app load - RUNS ONCE
  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;
    useAuthStore.getState().checkAuth();
  }, []); // empty array — runs ONCE on mount only

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* ── Protected Routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/session" element={<SessionPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/stats" element={<StatsDashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/zen" element={<ZenModePage />} />
        </Route>

        {/* ── 404 Not Found ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}
