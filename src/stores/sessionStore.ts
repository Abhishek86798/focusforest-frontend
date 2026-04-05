import { create } from 'zustand';
import type { SessionVariant } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Session Store — tracks the active timer state across the app
// Persists the user's chosen variant and task text between page navigations.
// ─────────────────────────────────────────────────────────────────────────────

interface SessionState {
  // The chosen timer variant
  selectedVariant: SessionVariant;
  // Override focus/break minutes (used for 'custom' variant)
  customFocusMinutes: number;
  customBreakMinutes: number;
  // Task text entered by user (null = no task set)
  taskText: string | null;
  // Whether to always use this variant (skip picker next time)
  alwaysUseVariant: boolean;

  setVariant: (variant: SessionVariant) => void;
  setCustomTimes: (focusMinutes: number, breakMinutes: number) => void;
  setTaskText: (text: string | null) => void;
  setAlwaysUse: (value: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  selectedVariant: 'classic',
  customFocusMinutes: 25,
  customBreakMinutes: 5,
  taskText: null,
  alwaysUseVariant: false,

  setVariant: variant => set({ selectedVariant: variant }),
  setCustomTimes: (focusMinutes, breakMinutes) =>
    set({ customFocusMinutes: focusMinutes, customBreakMinutes: breakMinutes }),
  setTaskText: text => set({ taskText: text }),
  setAlwaysUse: value => set({ alwaysUseVariant: value }),
  reset: () =>
    set({
      taskText: null,
      // Keep selectedVariant and alwaysUseVariant across sessions
    }),
}));
