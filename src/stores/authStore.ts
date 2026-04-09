import { create } from 'zustand';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // NEW: Track if initial auth check is done
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false, // NEW: Start false

  checkAuth: async () => {
    const { isInitialized, user } = get();
    if (isInitialized && user) {
      console.log('ℹ️ Auth already initialized with user, skipping check');
      return;
    }

    console.log('🔍 Running initial auth check...');
    
    try {
      const response = await apiClient.get<User>('/auth/me');
      console.log('✅ Auth check successful:', response.data.email);
      set({ 
        user: response.data, 
        isLoading: false,
        isInitialized: true 
      });
    } catch (error: any) {
      // 401 is normal — just means not logged in
      console.log('ℹ️ Not authenticated (expected when not logged in)');
      set({ 
        user: null, 
        isLoading: false,
        isInitialized: true 
      });
    }
  },

  login: async (email: string, password: string) => {
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║  🔐 LOGIN FLOW - Starting                            ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('📧 Email:', email);
    
    try {
      // Step 1: Send login request
      console.log('\n📤 Step 1: Sending POST /auth/login...');
      const response = await apiClient.post<{ user: User }>('/auth/login', {
        email,
        password,
      });
      
      console.log('✅ Step 1 Complete: Login request succeeded');
      console.log('   Status:', response.status);
      console.log('   User:', response.data.user.email);
      
      // Step 2: Set user in store
      console.log('\n💾 Step 2: Setting user in auth store...');
      set({ 
        user: response.data.user, 
        isLoading: false,
        isInitialized: true 
      });
      console.log('✅ Step 2 Complete: User set in store');
      
      console.log('\n╔═══════════════════════════════════════════════════════╗');
      console.log('║  🔐 LOGIN FLOW - Complete                            ║');
      console.log('╚═══════════════════════════════════════════════════════╝\n');
      
    } catch (error) {
      console.log('\n╔═══════════════════════════════════════════════════════╗');
      console.log('║  ❌ LOGIN FAILED                                     ║');
      console.log('╚═══════════════════════════════════════════════════════╝');
      console.error('   Error:', error);
      throw error; // Re-throw so LoginPage can handle it
    }
  },

  logout: async () => {
    console.log('🚪 Logging out...');
    
    try {
      await apiClient.post('/auth/logout');
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout request failed, clearing local state anyway');
    }
    
    // Always clear local state, even if API call fails
    set({ 
      user: null, 
      isLoading: false,
      isInitialized: true // Keep initialized true
    });
    
    toast('Logged out');
  },

  signup: async (email: string, password: string, name: string) => {
    console.log('📝 Attempting signup...');
    
    try {
      const utcOffset = new Date().getTimezoneOffset() * -1;
      const response = await apiClient.post<{ user: User }>('/auth/signup', {
        email,
        password,
        name,
        utcOffset,
      });
      
      console.log('✅ Signup successful:', response.data.user.email);
      
      // Set user immediately from signup response
      set({ 
        user: response.data.user, 
        isLoading: false,
        isInitialized: true 
      });
      
    } catch (error) {
      console.error('❌ Signup failed');
      throw error; // Re-throw so SignupPage can handle it
    }
  },

  updateProfile: async (data: { name?: string; avatarUrl?: string | null; isPrivate?: boolean }) => {
    const response = await apiClient.patch<User>('/auth/profile', data);
    set({ user: response.data });
    toast.success('Profile updated');
  },
}));

