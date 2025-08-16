import { io, Socket } from 'socket.io-client';
import { mockIo, MockSocket } from './mockSocket';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
const USE_MOCK_SOCKET = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || true;

class SocketManager {
  private socket: Socket | MockSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token: string): Socket | MockSocket {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (USE_MOCK_SOCKET) {
      console.log('Using mock Socket.IO client');
      this.socket = mockIo(SOCKET_URL, { auth: { token } }) as MockSocket;
      this.setupMockEventHandlers();
    } else {
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 20000,
      });
      this.setupRealEventHandlers();
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | MockSocket | null {
    return this.socket;
  }

  private setupMockEventHandlers(): void {
    console.log('Mock socket setup complete');
  }

  private setupRealEventHandlers(): void {
    if (!this.socket) return;
    const realSocket = this.socket as Socket;

    realSocket.on('connect', () => {
      console.log('Socket connected:', realSocket.id);
      this.reconnectAttempts = 0;
    });

    realSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    realSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    realSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    realSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    realSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });
  }

  // Chat related methods
  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId });
  }

  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId });
  }

  sendMessage(data: { receiverId: string; content: string; conversationId: string }): void {
    this.emit('message:send', data);
  }

  markMessageAsRead(messageId: string): void {
    this.emit('message:read', { messageId });
  }

  startTyping(conversationId: string): void {
    this.emit('message:typing', { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.emit('message:stop-typing', { conversationId });
  }

  // Call related methods
  initiateCall(data: { receiverId: string; callType: 'audio' | 'video' }): void {
    this.emit('call:initiate', data);
  }

  acceptCall(): void {
    this.emit('call:accept');
  }

  rejectCall(): void {
    this.emit('call:reject');
  }

  endCall(): void {
    this.emit('call:end');
  }

  sendCallOffer(offer: RTCSessionDescriptionInit): void {
    this.emit('call:offer', offer);
  }

  sendCallAnswer(answer: RTCSessionDescriptionInit): void {
    this.emit('call:answer', answer);
  }

  sendIceCandidate(candidate: RTCIceCandidate): void {
    this.emit('call:ice-candidate', candidate);
  }

  // Presence methods
  updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): void {
    this.emit('user:presence', { status });
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// Helper hooks for React components
export const useSocket = () => {
  return {
    socket: socketManager.getSocket(),
    isConnected: socketManager.isConnected(),
    emit: socketManager.emit.bind(socketManager),
    on: socketManager.on.bind(socketManager),
    off: socketManager.off.bind(socketManager),
  };
};
