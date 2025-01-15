import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../message/entities/message.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    const room = this.roomRepository.create(createRoomDto);
    return this.roomRepository.save(room);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find();
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    await this.roomRepository.update(id, updateRoomDto);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.roomRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
  }

  async getGeneralMessages(): Promise<Message[]> {
    return this.messageRepository.find({
      where: { id: 'f707e232-cc81-43f9-bdc1-6d32d1366504' }, // Assuming 'general' is the room ID
      order: { createdAt: 'ASC' },
    });
  }
  async isPlayerAllowed(
    roomIdentifier: string,
    playerId: string,
  ): Promise<boolean> {
    const room = await this.roomRepository.findOne({
      where: { id: roomIdentifier },
    });
    if (!room) {
      throw new NotFoundException(
        `Room with identifier ${roomIdentifier} not found`,
      );
    }
    return room.allowedPlayerIds.includes(playerId);
  }
  async saveMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }

  async getPrivateMessages(
    senderId: string,
    receiverId: string,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }, // Both directions
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
