'use client';

import React, { useEffect } from 'react';
import { useChatStore } from '@/lib/store/chat';
import { chatAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import { Avatar } from '@/components/ui';

interface UserListProps {
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

export const UserList: React.FC<UserListProps> = ({ onSelect, selectedId }) => {
  const { conversations, setConversations } = useChatStore();
  const { token } = useAuthStore();

  useEffect(() => {
    // Load conversations when component mounts
    async function loadConversations() {
      if (!token) return;
      try {
        const response = await chatAPI.getConversations(token);
        if (response.success && response.data) {
          setConversations(response.data as any[]);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }

    loadConversations();
  }, [token, setConversations]);

  return (
    <div className="w-full h-full bg-gray-900 border-r border-gray-800 overflow-y-auto">
      {conversations.map((conv) => {
        const user = conv.participants[0]; // Simplified, should filter out self
        return (
          <div
            key={conv.id}
            className={`flex items-center px-4 py-3 cursor-pointer transition-colors
              ${selectedId === conv.id ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
            onClick={() => onSelect(conv.id)}
          >
            <Avatar src={user.avatar} alt={user.username} size="md" online={user.isOnline} />
            <div className="ml-3 flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{user.username}</div>
              <div className="text-xs text-gray-400 truncate">
                {conv.lastMessage?.content || 'No messages yet'}
              </div>
            </div>
            {conv.unreadCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {conv.unreadCount}
              </span>
            )}
          </div>
        );
      })}
      
      {conversations.length === 0 && (
        <div className="p-4 text-center text-gray-400">
          <p>No conversations yet</p>
          <p className="text-xs mt-1">Start chatting with friends!</p>
        </div>
      )}
    </div>
  );
};
