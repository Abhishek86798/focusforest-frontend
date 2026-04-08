import { create } from 'zustand';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean }) => Promise<void>;
}

// Module-level flag — persists across renders, most reliable guard
let authCheckComplete = false;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // start true so ProtectedRoute shows loader initially

  checkAuth: async () => {
    // If already ran, return immediately — no API call
    if (authCheckComplete) return;
    authCheckComplete = true; // set BEFORE the async call

    try {
      const response = await apiClient.get<User>('/auth/me');
      set({ user: response.data, isLoading: false });
    } catch (error: any) {
      // 401 is normal — just means not logged in
      set({ user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    // Set user from login response - no need to re-verify immediately
    set({ user: response.data.user, isLoading: false });
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    authCheckComplete = false; // reset so next login triggers fresh check
    set({ user: null, isLoading: true });
    toast('Logged out');
  },

  signup: async (email: string, password: string, name: string) => {
    const utcOffset = new Date().getTimezoneOffset() * -1;
    const response = await apiClient.post<{ user: User }>('/auth/signup', {
      email,
      password,
      name,
      utcOffset,
    });
    // Set user from signup response - no need to re-verify immediately
    set({ user: response.data.user, isLoading: false });
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean }) => {
    const response = await apiClient.patch<User>('/auth/profile', data);
    set({ user: response.data });
    toast.success('Profile updated');
  },
}));

