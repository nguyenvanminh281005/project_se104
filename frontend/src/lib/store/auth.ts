import { create } from 'zustand';
import { AuthState, User } from '@/types';

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: (user: User, token: string) => {
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
      localStorage.setItem('auth-user', JSON.stringify(user));
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('auth-user');
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-user', JSON.stringify(updatedUser));
      }
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
