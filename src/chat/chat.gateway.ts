import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } }) // Allow all origins (for development)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {} // Inject ChatService

  // Triggered when a client connects
  async handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);

    try {
      // Fetch messages from the 'general' room
      const generalMessages = await this.chatService.getGeneralMessages();

      // Send the 'general' room messages to the connected client
      socket.emit('generalMessages', generalMessages);

      // Notify other clients about the new user connection
      this.server.emit('userConnected', { clientId: socket.id });
    } catch (error) {
      this.logger.error(`Error fetching general messages: ${error.message}`);
    }
  }

  // Triggered when a client disconnects
  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.server.emit('userDisconnected', { clientId: socket.id });
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
  ) {
    this.logger.log(`Message from ${payload.senderName}: ${payload.content}`);

    try {
      // Create the message object with senderId, senderName, content, and roomId
      const message = {
        senderId: payload.senderId,
        senderName: payload.senderName, // Directly use senderName from payload
        content: payload.content,
        roomId: payload.roomId,
      };

      // Save the message to the database
      const savedMessage = await this.chatService.saveMessage(message);

      // Broadcast the message to all connected clients in the room
      this.server.emit('chat', savedMessage);
    } catch (error) {
      this.logger.error('Error saving message:', error.message);
    }
  }
}
