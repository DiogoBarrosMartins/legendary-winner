import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Create a new chat room' })
  @ApiBody({ type: CreateRoomDto })
  @Post('rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return await this.chatService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Retrieve all chat rooms' })
  @Get('rooms')
  async getAllRooms() {
    return await this.chatService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a chat room by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Room ID' })
  @Get('rooms/:id')
  async getRoomById(@Param('id') id: string) {
    return await this.chatService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a chat room' })
  @ApiParam({ name: 'id', type: String, description: 'Room ID' })
  @ApiBody({ type: UpdateRoomDto })
  @Patch('rooms/:id')
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return await this.chatService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete a chat room' })
  @ApiParam({ name: 'id', type: String, description: 'Room ID' })
  @Delete('rooms/:id')
  async deleteRoom(@Param('id') id: string) {
    return await this.chatService.delete(id);
  }

  @ApiOperation({ summary: 'Retrieve private messages between two users' })
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
  @Get('private')
  async getPrivateMessages(
    @Query('senderId') senderId: string,
    @Query('receiverId') receiverId: string,
  ) {
    return await this.chatService.getPrivateMessages(senderId, receiverId);
  }
}
