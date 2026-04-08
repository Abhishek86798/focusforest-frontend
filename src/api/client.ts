import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Global response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || '';
    const status = error.response?.status;
    
    // Log all errors for debugging
    console.error('API Error:', {
      url: requestUrl,
      status: status,
      data: error.response?.data,
      message: error.message,
    });
    
    // Never auto-redirect on these URLs — they handle their own logic
    const isAuthRoute = requestUrl.includes('/auth/login') || 
                       requestUrl.includes('/auth/signup') || 
                       requestUrl.includes('/auth/me');
    
    // Handle 401 Unauthorized
    if (status === 401 && !isAuthRoute) {
      // Check if user is actually logged in before redirecting
      // This prevents redirect loops during login flow
      const { useAuthStore } = await import('../stores/authStore');
      const user = useAuthStore.getState().user;
      
      // Only redirect if we thought we had a user but got 401
      // This means session expired
      // TEMPORARILY DISABLED to debug cookie issues
      console.warn('Got 401 but NOT redirecting. User in store:', user);
      // if (user) {
      //   useAuthStore.getState().logout();
      //   window.location.href = '/login';
      // }
    }
    
    // Handle 500 Server Errors - just reject, don't redirect or loop
    if (status === 500) {
      // Only show toast if NOT during the initial auth check
      if (!requestUrl.includes('/auth/me')) {
        toast.error('Server error. Try again in a moment.');
      }
    }
    
    // Handle network errors (no response from server)
    if (!error.response) {
      console.error('Connection error. Check your internet.');
      toast.error('Connection error. Check your internet.');
    }
    
    return Promise.reject(error);
  }
);

// Log all requests for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
