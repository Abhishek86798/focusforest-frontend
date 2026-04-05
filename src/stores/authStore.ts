import { create } from 'zustand';
import { authApi } from '../api';
import type { User } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Auth Store — manages authentication state globally
// JWT lives in httpOnly cookie (handled by browser automatically).
// This store only tracks the user object and loading state.
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  /** Check auth status on app load — calls GET /auth/me */
  checkAuth: () => Promise<void>;

  /** Log in with email + password */
  login: (email: string, password: string) => Promise<void>;

  /** Sign up a new account */
  signup: (name: string, email: string, password: string) => Promise<void>;

  /** Log out — clears cookie via backend */
  logout: () => Promise<void>;

  /** Clear any error message */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,   // true on first load — prevents flash of login redirect
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isLoading: false });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { accessToken } = await authApi.login(email, password);
      localStorage.setItem('accessToken', accessToken);
      // After login, fetch the full user object
      const user = await authApi.me();
      set({ user, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { cleanMessage?: string }).cleanMessage ?? 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw err; // re-throw so form can handle it too
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const utcOffset = new Date().getTimezoneOffset() * -1;
      const { accessToken } = await authApi.signup({ name, email, password, utcOffset });
      localStorage.setItem('accessToken', accessToken);
      const user = await authApi.me();
      set({ user, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { cleanMessage?: string }).cleanMessage ?? 'Signup failed. Please try again.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isLoading: false, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));
