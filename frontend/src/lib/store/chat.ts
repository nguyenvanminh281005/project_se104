import { create } from 'zustand';
import { Message, Conversation } from '@/types';

interface ChatStore {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; // conversationId -> userIds
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  markMessagesAsRead: (conversationId: string) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  setTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  onlineUsers: new Set(),
  typingUsers: {},

  setConversations: (conversations: Conversation[]) => {
    set({ conversations });
  },

  setActiveConversation: (conversation: Conversation | null) => {
    set({ activeConversation: conversation });
  },

  addMessage: (message: Message) => {
    const { messages, conversations } = get();
    const conversationId = message.senderId === message.receiverId 
      ? message.senderId 
      : [message.senderId, message.receiverId].sort().join('-');

    // Add message to messages
    const conversationMessages = messages[conversationId] || [];
    const newMessages = {
      ...messages,
      [conversationId]: [...conversationMessages, message].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    };

    // Update conversation last message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: message,
          updatedAt: message.timestamp,
          unreadCount: conv.unreadCount + (message.isRead ? 0 : 1),
        };
      }
      return conv;
    });

    set({
      messages: newMessages,
      conversations: updatedConversations,
    });
  },

  setMessages: (conversationId: string, messages: Message[]) => {
    const currentMessages = get().messages;
    set({
      messages: {
        ...currentMessages,
        [conversationId]: messages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      },
    });
  },

  markMessagesAsRead: (conversationId: string) => {
    const { messages, conversations } = get();
    
    // Mark messages as read
    const conversationMessages = messages[conversationId] || [];
    const updatedMessages = conversationMessages.map(msg => ({
      ...msg,
      isRead: true,
    }));

    // Update conversation unread count
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    });

    set({
      messages: {
        ...messages,
        [conversationId]: updatedMessages,
      },
      conversations: updatedConversations,
    });
  },

  updateUserOnlineStatus: (userId: string, isOnline: boolean) => {
    const { onlineUsers } = get();
    const newOnlineUsers = new Set(onlineUsers);
    
    if (isOnline) {
      newOnlineUsers.add(userId);
    } else {
      newOnlineUsers.delete(userId);
    }
    
    set({ onlineUsers: newOnlineUsers });
  },

  setTypingStatus: (conversationId: string, userId: string, isTyping: boolean) => {
    const { typingUsers } = get();
    const conversationTypingUsers = typingUsers[conversationId] || [];
    
    let updatedTypingUsers;
    if (isTyping) {
      updatedTypingUsers = [...conversationTypingUsers.filter(id => id !== userId), userId];
    } else {
      updatedTypingUsers = conversationTypingUsers.filter(id => id !== userId);
    }

    set({
      typingUsers: {
        ...typingUsers,
        [conversationId]: updatedTypingUsers,
      },
    });
  },

  updateConversationLastMessage: (conversationId: string, message: Message) => {
    const { conversations } = get();
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: message,
          updatedAt: message.timestamp,
        };
      }
      return conv;
    });

    set({ conversations: updatedConversations });
  },
}));
