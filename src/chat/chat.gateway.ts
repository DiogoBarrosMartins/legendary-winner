import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    const { userId } = socket.handshake.query as { userId?: string };

    // Enforce presence of userId for authenticated connections
    if (!userId) {
      this.logger.warn(`Socket ${socket.id} missing userId, disconnecting.`);
      socket.disconnect();
      return;
    }
    // Join user's personal room for private messaging
    socket.join(userId);
    this.logger.log(`Socket ${socket.id} joined personal room: ${userId}`);
    // Join the general room for public messaging
    socket.join('general');
    this.logger.log(`Socket ${socket.id} joined room: general`);

    try {
      const generalMessages = await this.chatService.getGeneralMessages();
      socket.emit('generalMessages', generalMessages);
      this.server
        .to('general')
        .emit('userConnected', { clientId: socket.id, userId });
    } catch (error) {
      this.logger.error(`Error fetching general messages: ${error.message}`);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.server.to('general').emit('userDisconnected', { clientId: socket.id });
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @MessageBody()
    payload: {
      senderId: string;
      senderName: string;
      content: string;
      roomId: string;
    },
    client: Socket,
  ) {
    this.logger.log(`Message from ${payload.senderName}: ${payload.content}`);
    try {
      // Validate sender authorization for the room
      const isAllowed = await this.chatService.isPlayerAllowed(
        payload.roomId,
        payload.senderId,
      );
      if (!isAllowed) {
        throw new UnauthorizedException('User is not allowed in this room.');
      }

      const message = {
        senderId: payload.senderId,
        senderName: payload.senderName,
        content: payload.content,
        roomId: payload.roomId,
      };

      const savedMessage = await this.chatService.saveMessage(message);
      // Broadcast the message to clients in the specified room only
      this.server.to(payload.roomId).emit('chat', savedMessage);
    } catch (error) {
      this.logger.error(`Error processing chat message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('privateChat')
  async handlePrivateChat(
    @MessageBody()
    payload: { senderId: string; receiverId: string; content: string },
    client: Socket,
  ) {
    this.logger.log(
      `Private message from ${payload.senderId} to ${payload.receiverId}`,
    );
    try {
      const message = {
        senderId: payload.senderId,
        receiverId: payload.receiverId,
        content: payload.content,
      };

      const savedMessage = await this.chatService.saveMessage(message);
      // Emit the private message to both sender's and receiver's personal rooms
      this.server.to(payload.senderId).emit('privateChat', savedMessage);
      this.server.to(payload.receiverId).emit('privateChat', savedMessage);
    } catch (error) {
      this.logger.error(`Error processing private message: ${error.message}`);
      client.emit('error', { message: error.message });
    }
  }
}
