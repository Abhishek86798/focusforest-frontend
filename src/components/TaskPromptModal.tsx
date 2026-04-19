import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TaskPromptModalProps {
  isOpen: boolean;
  carriedTask?: string | null;
  onStart: (taskText: string | null) => void;
  onCancel: () => void;
}

export default function TaskPromptModal({ isOpen, carriedTask, onStart, onCancel }: TaskPromptModalProps) {
  const [task, setTask] = useState('');

  // Sync the carried task specifically when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTask(carriedTask || '');
    }
  }, [isOpen, carriedTask]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(26,26,26,0.55)',
            backdropFilter: 'blur(2px)',
          }}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{
            position: 'relative',
            background: '#FAFAFA',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }}
        >
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700,
            fontSize: '24px',
            color: '#1A1A1A',
            marginBottom: '8px',
            lineHeight: 1.2
          }}>
            What do you want to accomplish?
          </h2>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: 'rgba(26,26,26,0.6)',
            marginBottom: '20px'
          }}>
            Setting a task earns 1.5x growth when completed ✨
          </p>

          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Finish Chapter 4 notes..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1.5px solid rgba(26,26,26,0.15)',
              borderRadius: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              color: '#1A1A1A',
              outline: 'none',
              background: '#FFFFFF',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#006D37')}
            onBlur={(e) => (e.target.style.borderColor = 'rgba(26,26,26,0.15)')}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onStart(task.trim() || null);
              }
            }}
          />

          {carriedTask && (
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              color: '#B45309', // amber-700
              marginTop: '10px',
              fontWeight: 500
            }}>
              ➡️ Carried forward from last session
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px 16px',
                background: 'rgba(26,26,26,0.05)',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26,26,26,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(26,26,26,0.05)')}
            >
              Cancel
            </button>
            <button
              onClick={() => onStart(task.trim() || null)}
              style={{
                flex: 1,
                padding: '14px 16px',
                background: '#006D37',
                color: '#FAFAFA',
                border: 'none',
                borderRadius: '8px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#00592D')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#006D37')}
            >
              {task.trim() ? '🎯 Start Focus' : 'Start Without Task'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
