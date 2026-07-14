import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '../store/auth.store';

// We use an environment variable or default to localhost:3000 (Docker backend mapping)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token if it exists
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token') || useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error Interceptor:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    if (error.response?.status === 401) {
      // Token is invalid or expired
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
