import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('private')
  @ApiQuery({ name: 'senderId', type: String, description: 'Sender ID' })
  @ApiQuery({ name: 'receiverId', type: String, description: 'Receiver ID' })
  @ApiResponse({
    status: 200,
    description: 'List of private messages',
    schema: {
      example: [
        {
          id: '1',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'Hey there!',
          createdAt: '2025-01-15T00:00:00.000Z',
        },
      ],
    },
  })
  async getPrivateMessages(
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
  ) {
    return this.chatService.getPrivateMessages(senderId, receiverId);
  }
}
