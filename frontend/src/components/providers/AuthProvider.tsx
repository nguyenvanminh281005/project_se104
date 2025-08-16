'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { login, setLoading } = useAuthStore();

  useEffect(() => {
    // Restore auth state from localStorage on app start
    const restoreAuth = () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth-token');
        const userStr = localStorage.getItem('auth-user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          login(user, token);
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        // Clear corrupted data
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth-user');
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, [login, setLoading]);

  return <>{children}</>;
};
