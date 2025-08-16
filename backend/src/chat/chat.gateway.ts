import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../common/services/redis.service';
import { CreateMessageDto } from './dto/chat.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private redisService: RedisService,
  ) {}

  afterInit(server: Server) {
    console.log('💬 Chat WebSocket server initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token (you might need to implement this method in AuthService)
      // For now, we'll use a simple approach
      const payload = this.decodeJWT(token);
      const user = await this.authService.getProfile(payload.id);
      
      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.user = user;
      this.connectedUsers.set(client.id, user.id);

      // Set user online in Redis
      await this.redisService.setUserOnline(user.id);

      // Join user to their conversation rooms
      const conversations = await this.chatService.getUserConversations(user.id);
      for (const conversation of conversations) {
        client.join(`conversation:${conversation.id}`);
      }

      // Notify others that user is online
      client.broadcast.emit('user:online', { userId: user.id });

      console.log(`User ${user.username} connected to chat`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // Set user offline in Redis
      await this.redisService.setUserOffline(userId);
      
      // Notify others that user is offline
      client.broadcast.emit('user:offline', { userId });
      
      console.log(`User ${userId} disconnected from chat`);
    }
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const message = await this.chatService.createMessage(data, client.userId);

      // Emit to all participants in the conversation
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('message:receive', message);

      return { success: true, message };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Verify user is participant
      await this.chatService.getConversationById(data.conversationId, client.userId);
      
      client.join(`conversation:${data.conversationId}`);
      
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`conversation:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @MessageBody() data: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      return { error: 'Unauthorized' };
    }

    // Broadcast typing status to other participants
    client.to(`conversation:${data.conversationId}`).emit('user:typing', {
      userId: client.userId,
      isTyping: data.isTyping,
    });

    return { success: true };
  }

  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @MessageBody() data: { messageId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      await this.chatService.markMessageAsRead(data.messageId, client.userId);
      
      // You could emit read receipt to sender
      // this.server.emit('message:read', { messageId: data.messageId, userId: client.userId });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Utility method to decode JWT (basic implementation)
  private decodeJWT(token: string): any {
    try {
      const base64Payload = token.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString();
      return JSON.parse(payload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Method to emit message to specific conversation
  async emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }

  // Method to emit to specific user (if online)
  async emitToUser(userId: string, event: string, data: any) {
    // Find user's socket
    for (const [socketId, connectedUserId] of this.connectedUsers.entries()) {
      if (connectedUserId === userId) {
        this.server.to(socketId).emit(event, data);
        break;
      }
    }
  }
}
