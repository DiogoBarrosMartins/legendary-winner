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

  @ApiOperation({ summary: 'Create a new room' }) // Describes the endpoint
  @ApiBody({ type: CreateRoomDto }) // Specifies the body structure
  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.chatService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Get all rooms' }) // Describes the endpoint
  @Get()
  async getAllRooms() {
    return this.chatService.findAll();
  }

  @ApiOperation({ summary: 'Get room details by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @ApiOperation({ summary: 'Update room details by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @ApiBody({ type: UpdateRoomDto }) // Specifies the body structure
  @Patch(':id')
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.chatService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete a room by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return this.chatService.delete(id);
  }
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
