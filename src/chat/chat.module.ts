import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { Message } from '../message/entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Message]),],
  controllers: [ChatController, RoomController],
  providers: [ChatService, ChatGateway, RoomService],
  exports: [ChatService, RoomService, ChatGateway],
})
export class ChatModule {}
