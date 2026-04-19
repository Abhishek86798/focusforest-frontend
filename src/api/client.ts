import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

const TOKEN_KEY = 'ff_access_token';

// CRITICAL: Use environment variable for baseURL
// Development: Points directly to deployed backend via Vite proxy
// Production: Points to deployed backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Still send cookies as fallback
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token to every request if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser auto-set Content-Type (with boundary) for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Global response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const requestUrl = error.config?.url || '';
    const status = error.response?.status;
    
    // Never auto-redirect on these URLs — they handle their own logic
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup') || requestUrl.includes('/auth/me');
    
    // Don't log 401 on /auth/me during initial check - it's expected when not logged in
    if (!(status === 401 && requestUrl.includes('/auth/me'))) {
      console.error('❌ API Error:', {
        url: requestUrl,
        status: status,
        data: error.response?.data,
      });
    }
    
    // Handle 401 Unauthorized on protected routes
    if (status === 401 && !isAuthRoute) {
      // Clear auth state only — route guards in App.tsx handle the redirect
      localStorage.removeItem(TOKEN_KEY);
      useAuthStore.getState().logout();
    }
    
    // Handle 500 Server Errors
    if (status === 500) {
      // Only show toast if NOT during the initial auth check
      if (!requestUrl.includes('/auth/me')) {
        toast.error('Server error. Try again in a moment.');
      }
    }
    
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('❌ Connection error. Check your internet.');
      toast.error('Connection error. Check your internet.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
