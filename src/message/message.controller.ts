import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@ApiTags('Message')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiBody({
    type: CreateMessageDto,
    description: 'Data for creating a new message',
  })
  @ApiResponse({
    status: 201,
    description: 'The created message',
    type: Message,
  })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of all messages',
    type: [Message],
  })
  findAll() {
    return this.messageService.findAll();
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the message to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'The message details',
    type: Message,
  })
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the message to update',
    type: String,
  })
  @ApiBody({
    type: UpdateMessageDto,
    description: 'Data for updating a message',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated message',
    type: Message,
  })
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'The ID of the message to delete',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
