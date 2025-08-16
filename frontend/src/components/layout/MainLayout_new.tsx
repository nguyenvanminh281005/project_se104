'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MusicPlayer } from '@/components/music/MusicPlayer';
import { CallModal } from '@/components/call/CallModal';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { useAuthStore } from '@/lib/store/auth';
import { socketManager } from '@/lib/socket';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  // Auth-protected routes
  const authRoutes = ['/music', '/chat', '/friends', '/settings'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to login if not authenticated and trying to access protected route
  useEffect(() => {
    if (isAuthRoute && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAuthRoute, router]);

  // Initialize socket connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      socketManager.connect(token);
    } else {
      socketManager.disconnect();
    }

    return () => {
      socketManager.disconnect();
    };
  }, [isAuthenticated, token]);

  // Don't render main layout for auth pages
  if (pathname.startsWith('/auth')) {
    return (
      <div className="min-h-screen bg-gray-950">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      {isAuthenticated && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Music Player - Only show when authenticated */}
        {isAuthenticated && <MusicPlayer />}
      </div>

      {/* Global Modals */}
      <CallModal />
    </div>
  );
};

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
    </AuthProvider>
  );
};
