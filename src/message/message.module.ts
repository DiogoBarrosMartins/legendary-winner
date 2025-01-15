import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    forwardRef(() => ChatModule), // To resolve circular dependencies
    TypeOrmModule.forFeature([Message]), // Register Message entity
  ],
  exports: [TypeOrmModule], // Export TypeOrmModule to make MessageRepository available
})
export class MessageModule {}
