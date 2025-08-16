import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallService } from './call.service';
import { AuthService } from '../auth/auth.service';
import { RedisService } from '../common/services/redis.service';
import { InitiateCallDto, CallSignalingDto, CallResponseDto } from './dto/call.dto';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/call',
})
export class CallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId
  private callTimeouts = new Map<string, NodeJS.Timeout>(); // callId -> timeout

  constructor(
    private callService: CallService,
    private authService: AuthService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.decodeJWT(token);
      const user = await this.authService.getProfile(payload.id);
      
      if (!user) {
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.user = user;
      this.connectedUsers.set(client.id, user.id);

      console.log(`User ${user.username} connected to call service`);
    } catch (error) {
      console.error('Call connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedUsers.get(client.id);
    
    if (userId) {
      this.connectedUsers.delete(client.id);
      
      // End any active calls for this user
      const activeCall = await this.callService.getActiveCall(userId);
      if (activeCall) {
        await this.callService.endCall(activeCall.id, userId);
        
        // Notify other participant
        const otherUserId = activeCall.callerId === userId ? activeCall.calleeId : activeCall.callerId;
        this.emitToUser(otherUserId, 'call:ended', { callId: activeCall.id, reason: 'disconnect' });
      }
      
      console.log(`User ${userId} disconnected from call service`);
    }
  }

  @SubscribeMessage('call:initiate')
  async handleInitiateCall(
    @MessageBody() data: InitiateCallDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const call = await this.callService.initiateCall(data, client.userId);

      // Notify callee about incoming call
      this.emitToUser(data.calleeId, 'call:incoming', call);

      // Set timeout for auto-call logic (15 seconds)
      const timeout = setTimeout(async () => {
        await this.callService.autoCallTimeout(call.id);
        this.emitToUser(client.userId, 'call:timeout', { callId: call.id });
        this.emitToUser(data.calleeId, 'call:missed', { callId: call.id });
      }, 15000);

      this.callTimeouts.set(call.id, timeout);

      return { success: true, call };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call:respond')
  async handleCallResponse(
    @MessageBody() data: CallResponseDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const call = await this.callService.respondToCall(data, client.userId);

      // Clear timeout
      const timeout = this.callTimeouts.get(data.callId);
      if (timeout) {
        clearTimeout(timeout);
        this.callTimeouts.delete(data.callId);
      }

      // Notify caller about response
      const callerId = call.callerId;
      this.emitToUser(callerId, 'call:response', { call, action: data.action });

      if (data.action === 'accept') {
        // Both users join the call room
        const callerSocket = this.getUserSocket(callerId);
        const calleeSocket = this.getUserSocket(client.userId);
        
        if (callerSocket) callerSocket.join(`call:${call.id}`);
        if (calleeSocket) calleeSocket.join(`call:${call.id}`);

        this.server.to(`call:${call.id}`).emit('call:started', call);
      }

      return { success: true, call };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call:end')
  async handleEndCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const call = await this.callService.endCall(data.callId, client.userId);

      // Clear timeout
      const timeout = this.callTimeouts.get(data.callId);
      if (timeout) {
        clearTimeout(timeout);
        this.callTimeouts.delete(data.callId);
      }

      // Notify all participants
      this.server.to(`call:${data.callId}`).emit('call:ended', call);

      return { success: true, call };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call:signaling')
  async handleSignaling(
    @MessageBody() data: CallSignalingDto,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      const call = await this.callService.updateSignaling(data, client.userId);

      // Forward signaling data to other participant
      client.to(`call:${data.callId}`).emit('call:signaling', {
        callId: data.callId,
        from: client.userId,
        offer: data.offer,
        answer: data.answer,
        iceCandidate: data.iceCandidate,
      });

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('call:join')
  async handleJoinCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      if (!client.userId) {
        return { error: 'Unauthorized' };
      }

      // Verify user is participant
      await this.callService.getCallById(data.callId, client.userId);
      
      client.join(`call:${data.callId}`);
      
      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Utility methods
  private decodeJWT(token: string): any {
    try {
      const base64Payload = token.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString();
      return JSON.parse(payload);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  private getUserSocket(userId: string): Socket | null {
    for (const [socketId, connectedUserId] of this.connectedUsers.entries()) {
      if (connectedUserId === userId) {
        return this.server.sockets.sockets.get(socketId) || null;
      }
    }
    return null;
  }

  private emitToUser(userId: string, event: string, data: any) {
    const socket = this.getUserSocket(userId);
    if (socket) {
      socket.emit(event, data);
    }
  }
}
