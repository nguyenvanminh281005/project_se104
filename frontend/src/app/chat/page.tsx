'use client';

import React, { useState } from 'react';
import { UserList } from '@/components/chat/UserList';
import { ChatBox } from '@/components/chat/ChatBox';
import { MessageInput } from '@/components/chat/MessageInput';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      {/* User List */}
      <div className="w-72 border-r border-gray-800 bg-gray-900">
        <UserList onSelect={setSelectedConversation} selectedId={selectedConversation || undefined} />
      </div>
      {/* Chat Box */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatBox conversationId={selectedConversation} />
            <MessageInput conversationId={selectedConversation} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}
