import { useNavigate } from 'react-router-dom';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG         = '#F2F2F2';
const WHITE      = '#FFFFFF';
const GREEN      = '#006D37';
const DARK       = '#1A1A1A';
const SHADOW     = '4px 4px 0px 0px rgba(26,26,26,1)';
const BORDER     = '2px solid rgba(26,26,26,1)';

// ─── NotFoundPage ──────────────────────────────────────────────────────────────
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: BG,
      padding: '20px',
    }}>
      <div style={{
        background: WHITE,
        border: BORDER,
        boxShadow: SHADOW,
        borderRadius: '8px',
        padding: '64px 48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'center',
      }}>
        {/* 404 Number */}
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: '96px',
          lineHeight: '1em',
          color: DARK,
          letterSpacing: '-0.02em',
        }}>
          404
        </div>

        {/* Message */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '24px',
            color: DARK,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
          }}>
            Page Not Found
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            color: 'rgba(26,26,26,0.6)',
            margin: 0,
            lineHeight: '1.5em',
          }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Go Home Button */}
        <button
          onClick={() => navigate('/')}
          className="transition-all duration-200 ease-out active:scale-[0.97] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            width: '100%',
            maxWidth: '280px',
            padding: '16px 32px',
            background: GREEN,
            color: WHITE,
            border: BORDER,
            boxShadow: SHADOW,
            borderRadius: '4px',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
