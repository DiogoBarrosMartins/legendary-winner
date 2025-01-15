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
  import { BadRequestException } from '@nestjs/common';
  import { ChatService } from './chat.service';
  import { RoomService } from './room.service';
  
  @WebSocketGateway({ cors: { origin: '*' } })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly chatService: ChatService,
      private readonly roomService: RoomService,
    ) {}
  
    async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
      console.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(@ConnectedSocket() client: Socket): void {
      console.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('joinRoom')
    async joinRoom(
      @MessageBody() { userId, roomIdentifier }: { userId: string; roomIdentifier: string },
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      // Validate that the user can join the room
      const isAllowed = await this.roomService.isPlayerAllowed(roomIdentifier, userId);
      if (!isAllowed) {
        throw new BadRequestException('You are not allowed to join this room.');
      }
  
      // Join the room
      client.join(roomIdentifier); // Fix for `client.socketsJoin` – Use `Socket.join`
      console.log(`User ${userId} joined room: ${roomIdentifier}`);
    }
  
    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody()
      { senderId, content, roomIdentifier }: { senderId: string; content: string; roomIdentifier: string },
    ): Promise<void> {
      // Validate that the user can send messages in the room
      const isAllowed = await this.roomService.isPlayerAllowed(roomIdentifier, senderId);
      if (!isAllowed) {
        throw new BadRequestException('You are not allowed to send messages in this room.');
      }
  
      // Save the message to the database
      const savedMessage = await this.chatService.saveMessage({
        senderId,
        content,
        roomId: roomIdentifier, // Update to match your database schema
      });
  
      // Emit the message to the room
      this.server.to(roomIdentifier).emit('newMessage', savedMessage); // Fixed emit logic
    }
  }
  