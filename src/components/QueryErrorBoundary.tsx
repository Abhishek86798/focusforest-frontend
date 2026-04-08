/**
 * QueryErrorBoundary — Wraps React Query errors for pages
 * Shows error UI with retry button
 * Only shows for non-401 errors (401 handled by Axios interceptor)
 */

import { useQueryClient } from '@tanstack/react-query';

const BG = '#F2F2F2';
const WHITE = '#FFFFFF';
const GREEN = '#006D37';
const DARK = '#1A1A1A';
const SHADOW = '4px 4px 0px 0px rgba(26,26,26,1)';
const BORDER = '2px solid rgba(26,26,26,1)';

interface Props {
  error?: Error | null;
  resetError?: () => void;
}

export default function QueryErrorBoundary({ error, resetError }: Props) {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Refetch all queries
    queryClient.refetchQueries();
    // Reset error state if provided
    if (resetError) {
      resetError();
    }
  };

  // Don't show error boundary for 401 errors (handled by interceptor)
  if (error && 'response' in error && (error as any).response?.status === 401) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: BG,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: WHITE,
          border: BORDER,
          boxShadow: SHADOW,
          borderRadius: '8px',
          padding: '48px 32px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          alignItems: 'center',
        }}
      >
        {/* Error Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(220, 38, 38, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Message */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '24px',
              color: DARK,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            Something Went Wrong
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              color: 'rgba(26,26,26,0.6)',
              margin: 0,
              lineHeight: '1.5em',
            }}
          >
            We couldn't load this page. Please try again.
          </p>
        </div>

        {/* Try Again Button */}
        <button
          onClick={handleRetry}
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
            transition: 'transform 0.15s',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px 0px rgba(26,26,26,1)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = SHADOW;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(0, 0)';
            e.currentTarget.style.boxShadow = SHADOW;
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
