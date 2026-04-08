import { create } from 'zustand';
import type { SessionVariant } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Session Store — tracks the active timer state and session lifecycle
// Manages the full flow: start → complete/abandon → reset
// ─────────────────────────────────────────────────────────────────────────────

interface SessionState {
  // Timer variant selection
  selectedVariant: SessionVariant;
  customFocusMinutes: number;
  customBreakMinutes: number;
  alwaysUseVariant: boolean;
  
  // Task tracking
  taskText: string | null;
  
  // Active session tracking
  sessionId: string | null;           // Server-assigned ID from /sessions/start
  clientSessionId: string | null;     // Client-generated UUID before API call
  focusMinutes: number;               // Duration for current session
  isRunning: boolean;                 // Timer is actively counting down
  
  // Pomodoro set tracking (resets after 4 sessions)
  sessionCount: number;               // 0-3, tracks progress toward long break
  
  // Last completed session data (for streak display)
  lastStreak: number | null;

  // Actions
  setVariant: (variant: SessionVariant) => void;
  setCustomTimes: (focusMinutes: number, breakMinutes: number) => void;
  setTaskText: (text: string | null) => void;
  setAlwaysUse: (value: boolean) => void;
  
  // Session lifecycle
  startSession: (sessionId: string, clientSessionId: string, focusMinutes: number) => void;
  completeSession: (streak: number) => void;
  abandonSession: () => void;
  setRunning: (running: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Timer settings
  selectedVariant: 'classic',
  customFocusMinutes: 25,
  customBreakMinutes: 5,
  alwaysUseVariant: false,
  
  // Task
  taskText: null,
  
  // Active session
  sessionId: null,
  clientSessionId: null,
  focusMinutes: 25,
  isRunning: false,
  
  // Pomodoro tracking
  sessionCount: 0,
  
  // Streak
  lastStreak: null,

  // Setters
  setVariant: (variant) => set({ selectedVariant: variant }),
  
  setCustomTimes: (focusMinutes, breakMinutes) =>
    set({ customFocusMinutes: focusMinutes, customBreakMinutes: breakMinutes }),
  
  setTaskText: (text) => set({ taskText: text }),
  
  setAlwaysUse: (value) => set({ alwaysUseVariant: value }),
  
  // Session lifecycle
  startSession: (sessionId, clientSessionId, focusMinutes) =>
    set({ 
      sessionId, 
      clientSessionId, 
      focusMinutes,
      isRunning: true 
    }),
  
  completeSession: (streak) =>
    set((state) => ({
      sessionId: null,
      clientSessionId: null,
      isRunning: false,
      sessionCount: (state.sessionCount + 1) % 4, // Reset to 0 after 4th session
      lastStreak: streak,
      // Keep taskText if it was 'carried', otherwise clear it
    })),
  
  abandonSession: () =>
    set({
      sessionId: null,
      clientSessionId: null,
      isRunning: false,
      // Don't increment sessionCount on abandon
    }),
  
  setRunning: (running) => set({ isRunning: running }),
  
  reset: () =>
    set({
      taskText: null,
      sessionId: null,
      clientSessionId: null,
      isRunning: false,
      // Keep selectedVariant, alwaysUseVariant, and sessionCount
    }),
}));
