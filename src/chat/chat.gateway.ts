import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BadRequestException, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
@WebSocketGateway({ namespace: '/chatsocket', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('WebSocketGateway');
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {
    this.logger.log('WebSocket Gateway Initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('userConnected', { userId: client.id });
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody() data: { userId: string; roomIdentifier: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      this.logger.log(`Received joinRoom event: ${JSON.stringify(data)}`);

      const { userId, roomIdentifier } = data;

      // Validate input
      if (!userId || !roomIdentifier) {
        throw new BadRequestException('Missing userId or roomIdentifier');
      }

      // Check permission
      const isAllowed = await this.chatService.isPlayerAllowed(
        roomIdentifier,
        userId,
      );
      if (!isAllowed) {
        throw new BadRequestException('You are not allowed to join this room.');
      }

      // Join the room
      client.join(roomIdentifier);
      this.logger.log(`User ${userId} joined room: ${roomIdentifier}`);

      // Notify others
      this.server
        .to(roomIdentifier)
        .emit('userJoined', { userId, roomIdentifier });
    } catch (error) {
      this.logger.error('Error in joinRoom:', error.message);
      client.disconnect(); // Optional: force disconnect on error
    }
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(
    @MessageBody()
    { userId, roomIdentifier }: { userId: string; roomIdentifier: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomIdentifier);
    this.server.to(roomIdentifier).emit('userLeft', { userId, roomIdentifier });
  }
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody()
    {
      senderId,
      content,
      roomIdentifier,
    }: {
      senderId: string;
      content: string;
      roomIdentifier: string;
    },
  ): Promise<void> {
    try {
      const isAllowed = await this.chatService.isPlayerAllowed(
        roomIdentifier,
        senderId,
      );
      if (!isAllowed) {
        throw new BadRequestException(
          'You are not allowed to send messages in this room.',
        );
      }

      const savedMessage = await this.chatService.saveMessage({
        senderId,
        content,
        roomId: roomIdentifier,
      });
      this.server.to(roomIdentifier).emit('newMessage', savedMessage);
    } catch (error) {
      this.logger.error('Error in sendMessage:', error.message);
    }
  }
}
