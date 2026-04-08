/**
 * PageLoader — Full-page centered loading state
 * Shows FocusForest logo (green square) with pulse animation
 */

const GREEN = '#006D37';
const BG = '#F2F2F2';

export default function PageLoader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: BG,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          background: GREEN,
          borderRadius: '8px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
