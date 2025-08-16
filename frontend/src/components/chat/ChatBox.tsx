'use client';

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/store/chat';
import { useAuthStore } from '@/lib/store/auth';
import { chatAPI } from '@/lib/api';
import { Avatar } from '@/components/ui';
import { socketManager } from '@/lib/socket';

interface ChatBoxProps {
  conversationId: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ conversationId }) => {
  const { user, token } = useAuthStore();
  const { messages, setMessages, addMessage } = useChatStore();
  const messageList = messages[conversationId] || [];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Join conversation room
    socketManager.joinConversation(conversationId);
    
    // Load messages for this conversation
    async function loadMessages() {
      if (!token) return;
      try {
        const response = await chatAPI.getMessages(conversationId, token);
        if (response.success && response.data) {
          setMessages(conversationId, response.data as any[]);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    }

    loadMessages();
    
    return () => {
      socketManager.leaveConversation(conversationId);
    };
  }, [conversationId, token, setMessages]);

  useEffect(() => {
    // Scroll to bottom on new message
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList.length]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gray-900 p-4">
      {messageList.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end mb-2 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          {msg.senderId !== user?.id && (
            <Avatar src={undefined} size="sm" className="mr-2" />
          )}
          <div
            className={`px-4 py-2 rounded-lg max-w-xs break-words shadow text-sm
              ${msg.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'}`}
          >
            {msg.content}
          </div>
        </div>
      ))}
      {messageList.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
