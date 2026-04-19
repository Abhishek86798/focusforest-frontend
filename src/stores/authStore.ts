import { create } from 'zustand';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import type { User } from '../types';

const TOKEN_KEY = 'ff_access_token';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  accessToken: string | null;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean; default_variant?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  accessToken: localStorage.getItem(TOKEN_KEY),

  checkAuth: async () => {
    const { isInitialized, user } = get();
    if (isInitialized && user) {
      return;
    }

    try {
      const response = await apiClient.get<User>('/auth/me');
      set({ 
        user: response.data, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error: any) {
      // 401 is normal — just means not logged in
      set({ 
        user: null, 
        isLoading: false,
        isInitialized: true 
      });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ user: User; accessToken: string }>('/auth/login', {
        email,
        password,
      });
      
      const { user, accessToken } = response.data;

      // Persist token so the Bearer header is sent on subsequent calls
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }

      set({ 
        user,
        accessToken: accessToken || null,
        isLoading: false,
        isInitialized: true 
      });
    } catch (error) {
      console.error('   Error:', error);
      throw error; // Re-throw so LoginPage can handle it
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('❌ Logout request failed, clearing local state anyway');
    }
    
    // Always clear local state, even if API call fails
    localStorage.removeItem(TOKEN_KEY);
    set({ 
      user: null, 
      accessToken: null,
      isLoading: false,
      isInitialized: true
    });
    
    toast('Logged out');
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      const utcOffset = new Date().getTimezoneOffset() * -1;
      const response = await apiClient.post<{ user: User; accessToken: string }>('/auth/signup', {
        email,
        password,
        name,
        utcOffset,
      });
      
      const { user, accessToken } = response.data;

      // Persist token so the Bearer header is sent on subsequent calls
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }

      set({ 
        user,
        accessToken: accessToken || null,
        isLoading: false,
        isInitialized: true 
      });
      
    } catch (error) {
      console.error('❌ Signup failed');
      throw error; // Re-throw so SignupPage can handle it
    }
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean; default_variant?: string }) => {
    const response = await apiClient.patch<User>('/auth/profile', data);
    set({ user: response.data });
    toast.success('Profile updated');
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<{ status: string, data: { avatar_url: string } }>('/auth/avatar', formData);
    
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: response.data.data.avatar_url } : null
    }));

    return response.data.data.avatar_url;
  },

}));
