'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Music, 
  MessageCircle, 
  Users, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { Avatar } from '@/components/ui';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Home',
    path: '/',
    icon: <Home size={20} />,
  },
  {
    label: 'Music',
    path: '/music',
    icon: <Music size={20} />,
  },
  {
    label: 'Chat',
    path: '/chat',
    icon: <MessageCircle size={20} />,
  },
  {
    label: 'Friends',
    path: '/friends',
    icon: <Users size={20} />,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings size={20} />,
  },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed = false,
  onToggle
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by auth state change
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={`
      bg-gray-900 border-r border-gray-700 flex flex-col h-full transition-all duration-300
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Avatar
            src={user?.avatar}
            alt={user?.username || 'User'}
            size="md"
            online={user?.isOnline}
          />
          {!isCollapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="flex-shrink-0">
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="ml-3">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium
            text-gray-300 hover:bg-gray-800 hover:text-white transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut size={20} />
          {!isCollapsed && (
            <span className="ml-3">Logout</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle Button (optional) */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-gray-900 border border-gray-700 rounded-full p-1.5 hover:bg-gray-800 transition-colors"
        >
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};
