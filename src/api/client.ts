import axios from 'axios';
import toast from 'react-hot-toast';

// CRITICAL: Ensure withCredentials is true for ALL requests
const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // ✅ This sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log all requests for debugging
apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    const method = config.method?.toUpperCase() || 'GET';
    const baseURL = config.baseURL || '';
    const fullURL = baseURL + url;
    
    // Log ALL requests to see if they're going through proxy
    console.log(`\n🌐 API Request: ${method} ${url}`);
    console.log('   baseURL:', baseURL);
    console.log('   Full URL:', fullURL);
    console.log('   withCredentials:', config.withCredentials);
    
    // Check if URL is absolute (bypassing proxy)
    if (fullURL.startsWith('http://') || fullURL.startsWith('https://')) {
      if (!fullURL.includes('localhost')) {
        console.error('⚠️  WARNING: Request is going directly to external URL!');
        console.error('   This will BYPASS the Vite proxy!');
        console.error('   Cookies set on localhost will NOT be sent!');
        console.error('   Fix: Change baseURL to relative path like "/api/v1"');
      }
    } else {
      console.log('✅ Request is relative - will go through Vite proxy');
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
    // Log successful auth responses
    if (response.config.url?.includes('/auth/login') || response.config.url?.includes('/auth/signup')) {
      console.log('✅ Auth response received');
      console.log('ℹ️ Cookies are HttpOnly - check DevTools → Application → Cookies');
    }
    return response;
  },
  async (error) => {
    const requestUrl = error.config?.url || '';
    const status = error.response?.status;
    
    // Never auto-redirect on these URLs — they handle their own logic
    const isAuthRoute = requestUrl.includes('/auth/login') || 
                       requestUrl.includes('/auth/signup') || 
                       requestUrl.includes('/auth/me');
    
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
      // Check if user is actually logged in before redirecting
      const { useAuthStore } = await import('../stores/authStore');
      const user = useAuthStore.getState().user;
      
      console.warn('⚠️ Got 401 on protected route. User in store:', user ? user.email : 'null');
      
      // Only redirect if we thought we had a user but got 401
      // This means session expired
      if (user) {
        console.log('🔒 Session expired, logging out and redirecting to login');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
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
