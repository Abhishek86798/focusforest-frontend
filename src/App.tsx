import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';


// ── Pages ─────────────────────────────────────────────────────────────────────
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import DashboardPage      from './pages/DashboardPage';
import CalendarPage       from './pages/CalendarPage';
import StatsDashboardPage from './pages/StatsDashboardPage';
import GroupsPage         from './pages/GroupsPage';
import GroupDetailPage    from './pages/GroupDetailPage';
import LeaderboardPage    from './pages/LeaderboardPage';
import ZenModePage        from './pages/ZenModePage';
import ProfilePage        from './pages/ProfilePage';
import {
  SessionPage,
} from './pages/StubPages';

// ── Helpers ───────────────────────────────────────────────────────────────────
function P({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const checkAuth = useAuthStore(s => s.checkAuth);

  // Restore session from httpOnly cookie on every app load
  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/login"  element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* ── Protected ── */}
      <Route path="/dashboard"       element={<P><DashboardPage /></P>} />
      <Route path="/session"         element={<P><SessionPage /></P>} />
      <Route path="/calendar"        element={<P><CalendarPage /></P>} />
      <Route path="/stats"           element={<P><StatsDashboardPage /></P>} />
      <Route path="/profile"         element={<P><ProfilePage /></P>} />
      <Route path="/leaderboard"     element={<P><LeaderboardPage /></P>} />
      <Route path="/groups"          element={<P><GroupsPage /></P>} />
      <Route path="/groups/:id"      element={<P><GroupDetailPage /></P>} />
      <Route path="/zen"             element={<P><ZenModePage /></P>} />

      {/* ── Default: / → /dashboard ── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
