'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useChatStore } from '@/lib/store/chat';
import { chatAPI } from '@/lib/api';
import { socketManager } from '@/lib/socket';
import { Input, Button } from '@/components/ui';

interface MessageInputProps {
  conversationId: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({ conversationId }) => {
  const { user, token } = useAuthStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { addMessage } = useChatStore();

  const handleSend = async () => {
    if (!content.trim() || !user || !token) return;
    setLoading(true);
    // AI moderation before sending
    const modRes = await chatAPI.moderateMessage(content, token);
    if (!modRes.success) {
      setLoading(false);
      alert('Message blocked by moderation!');
      return;
    }
    // Send message via socket
    socketManager.sendMessage({
      receiverId: conversationId, // Simplified, should be userId
      content,
      conversationId,
    });
    // Optionally add to local store
    addMessage({
      id: Date.now().toString(),
      content,
      senderId: user.id,
      receiverId: conversationId,
      timestamp: new Date(),
      isRead: false,
      messageType: 'text',
    });
    setContent('');
    setLoading(false);
  };

  return (
    <div className="flex items-center p-4 bg-gray-900 border-t border-gray-800">
      <Input
        className="flex-1 mr-2"
        placeholder="Type a message..."
        value={content}
        onChange={e => setContent(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSend();
        }}
        disabled={loading}
      />
      <Button onClick={handleSend} disabled={loading || !content.trim()}>
        Send
      </Button>
    </div>
  );
};
