import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

import { Message } from '../message/entities/message.entity';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Message]), // Register both entities
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [],
})
export class ChatModule {}
