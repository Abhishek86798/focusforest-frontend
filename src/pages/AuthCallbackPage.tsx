import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthCallbackPage — OAuth callback handler.
 * Google OAuth is currently disabled; this page simply redirects to /login.
 * Kept as a registered route so existing OAuth redirect URLs don't 404.
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0d1f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(76,175,80,0.3)',
          borderTopColor: '#4caf50',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }} className="animate-spin" />
        <p style={{ color: '#81c784', fontSize: '16px' }}>Redirecting…</p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallbackPage;
