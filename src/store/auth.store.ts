import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'OPERATOR' | 'SUPERVISOR';
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, remember: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize state from cookies if available
  const token = Cookies.get('token') || null;
  let user: User | null = null;
  
  try {
    const userStr = Cookies.get('user');
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {
    console.error('Failed to parse user from cookie', e);
  }

  return {
    token,
    user,
    isAuthenticated: !!token,
    
    login: (token, user, remember) => {
      const expires = remember ? 7 : undefined;
      
      Cookies.set('token', token, { expires, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
      Cookies.set('user', JSON.stringify(user), { expires, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
      Cookies.set('role', user.role, { expires, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }); // For middleware routing

      set({ token, user, isAuthenticated: true });
    },
    
    logout: () => {
      Cookies.remove('token');
      Cookies.remove('user');
      Cookies.remove('role');
      set({ token: null, user: null, isAuthenticated: false });
      
      // Optional: force a reload or redirect here, though components should react to state change
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  };
});
