import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async findAll(): Promise<Message[]> {
    return this.messageRepository.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Message> {
    const message = await this.messageRepository.findOneBy({ id });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<Message> {
    const message = await this.findOne(id);
    Object.assign(message, updateMessageDto);
    return this.messageRepository.save(message);
  }

  async remove(id: string): Promise<void> {
    const result = await this.messageRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
  }
}
