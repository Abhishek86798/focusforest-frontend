import axios from 'axios';

/**
 * Central Axios instance for all FocusForest API calls.
 * Auth: JWT is stored in httpOnly cookies — NEVER localStorage.
 * withCredentials: true sends the cookie on every request automatically.
 */
const baseURL = import.meta.env.DEV 
  ? '/api/v1' 
  : 'https://focusforest-backend.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: surface error messages cleanly
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Attach a clean message to the error for use in components
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred';
    error.cleanMessage = message;
    return Promise.reject(error);
  }
);
