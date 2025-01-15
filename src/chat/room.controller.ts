import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@ApiTags('Rooms') // Group the controller in Swagger
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @ApiOperation({ summary: 'Create a new room' }) // Describes the endpoint
  @ApiBody({ type: CreateRoomDto }) // Specifies the body structure
  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @ApiOperation({ summary: 'Get all rooms' }) // Describes the endpoint
  @Get()
  async getAllRooms() {
    return this.roomService.findAll();
  }

  @ApiOperation({ summary: 'Get room details by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @ApiOperation({ summary: 'Update room details by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @ApiBody({ type: UpdateRoomDto }) // Specifies the body structure
  @Patch(':id')
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    return this.roomService.update(id, updateRoomDto);
  }

  @ApiOperation({ summary: 'Delete a room by ID' }) // Describes the endpoint
  @ApiParam({ name: 'id', type: String, description: 'Room ID' }) // Parameter description
  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return this.roomService.delete(id);
  }
}
