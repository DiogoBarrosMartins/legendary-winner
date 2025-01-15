import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message])], // Add this line
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService], // Export if needed in other modules
})
export class MessageModule {}
