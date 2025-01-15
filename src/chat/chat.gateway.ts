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

@WebSocketGateway({ cors: { origin: '*' } }) // Allow all origins (for development)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private logger = new Logger('ChatGateway');

  // Triggered when a client connects
  handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
    this.server.emit('userConnected', { clientId: socket.id });
  }

  // Triggered when a client disconnects
  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
    this.server.emit('userDisconnected', { clientId: socket.id });
  }

  // Handle incoming chat messages
  @SubscribeMessage('chat')
  handleMessage(@MessageBody() payload: { author: string; body: string }) {
    this.logger.log(`Message from ${payload.author}: ${payload.body}`);
    this.server.emit('chat', payload); // Broadcast the message to all clients
  }
}
