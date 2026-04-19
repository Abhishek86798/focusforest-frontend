import { motion, AnimatePresence } from 'framer-motion';

export interface SessionCompletePopupProps {
  isOpen: boolean;
  taskText: string | null;
  onComplete: (taskStatus: 'completed' | 'carried' | 'none') => Promise<void> | void;
  isSubmitting: boolean;
  submitError: string | null;
  onRetry: () => void;
}

export default function SessionCompletePopup({
  isOpen, taskText, onComplete, isSubmitting, submitError, onRetry
}: SessionCompletePopupProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,26,26,0.6)',
            backdropFilter: 'blur(4px)',
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'relative',
            background: '#FAFAFA',
            borderRadius: '24px',
            padding: '32px 24px',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Success icon */}
          <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>🎉</div>

          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '28px',
            color: '#1A1A1A',
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            Session Complete!
          </h2>

          {/* Task display */}
          {taskText ? (
            <>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                color: 'rgba(26,26,26,0.6)',
                marginBottom: '8px'
              }}>Your task:</p>
              
              <div style={{
                background: 'rgba(26,26,26,0.03)',
                border: '1px solid rgba(26,26,26,0.08)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '24px',
                width: '100%',
              }}>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '18px',
                  color: '#1A1A1A',
                  margin: 0,
                  wordBreak: 'break-word',
                }}>"{taskText}"</p>
              </div>

              {/* Error state */}
              {submitError && (
                <div style={{
                  background: '#FEF2F2', // red-50
                  border: '1px solid #FECACA', // red-200
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  width: '100%',
                }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#B91C1C', margin: 0 }}>
                    {submitError}
                  </p>
                  <button
                    onClick={onRetry}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#DC2626',
                      background: 'none', border: 'none', outline: 'none', textDecoration: 'underline',
                      marginTop: '4px', cursor: 'pointer', padding: 0,
                    }}
                  >
                    Retry submission
                  </button>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  onClick={() => onComplete('carried')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1, padding: '14px', background: 'rgba(26,26,26,0.05)', color: '#1A1A1A',
                    border: 'none', borderRadius: '12px', fontFamily: "'Inter', sans-serif",
                    fontWeight: 600, fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1, transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = 'rgba(26,26,26,0.1)')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = 'rgba(26,26,26,0.05)')}
                >
                  {isSubmitting ? '...' : '➡️ Carry Forward'}
                </button>
                <button
                  onClick={() => onComplete('completed')}
                  disabled={isSubmitting}
                  style={{
                    flex: 1, padding: '14px', background: '#006D37', color: '#FAFAFA',
                    border: 'none', borderRadius: '12px', fontFamily: "'Inter', sans-serif",
                    fontWeight: 600, fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1, transition: 'background 0.2s',
                    boxShadow: '0 4px 12px rgba(0, 109, 55, 0.2)'
                  }}
                  onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = '#00592D')}
                  onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = '#006D37')}
                >
                  {isSubmitting ? '...' : '✅ Done!'}
                </button>
              </div>

              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(26,26,26,0.4)', marginTop: '16px', margin: 0
              }}>
                Completing tasks earns 1.5× tree growth ✨
              </p>
            </>
          ) : (
            <>
              {/* No task was set */}
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'rgba(26,26,26,0.6)', marginBottom: '24px'
              }}>
                Great focus session! 💪
              </p>

              {submitError && (
                <div style={{
                  background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
                  padding: '12px 16px', marginBottom: '20px', width: '100%',
                }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#B91C1C', margin: 0 }}>
                    {submitError}
                  </p>
                  <button
                    onClick={onRetry}
                    style={{
                      fontFamily: "'Inter', sans-serif", fontSize: '13px', color: '#DC2626',
                      background: 'none', border: 'none', outline: 'none', textDecoration: 'underline',
                      marginTop: '4px', cursor: 'pointer', padding: 0,
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              <button
                onClick={() => onComplete('none')}
                disabled={isSubmitting}
                style={{
                  width: '100%', padding: '16px', background: '#006D37', color: '#FAFAFA',
                  border: 'none', borderRadius: '12px', fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, fontSize: '16px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.5 : 1, transition: 'background 0.2s',
                  boxShadow: '0 4px 12px rgba(0, 109, 55, 0.2)'
                }}
                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.background = '#00592D')}
                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.background = '#006D37')}
              >
                {isSubmitting ? 'Saving...' : 'Continue to Break ☕'}
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
