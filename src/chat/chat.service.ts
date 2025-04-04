import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../message/entities/message.entity';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    try {
      const room = this.roomRepository.create(createRoomDto);
      return await this.roomRepository.save(room);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create room.' + error.message,
      );
    }
  }

  async findAll(): Promise<Room[]> {
    return await this.roomRepository.find();
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

  async ensureGeneralRoomExists(): Promise<Room> {
    let generalRoom = await this.roomRepository.findOne({
      where: { name: 'general' },
    });
    if (!generalRoom) {
      generalRoom = this.roomRepository.create({ name: 'general' });
      generalRoom = await this.roomRepository.save(generalRoom);
    }
    return generalRoom;
  }

  async getGeneralMessages(): Promise<Message[]> {
    // Ensure the 'general' room exists
    const generalRoom = await this.ensureGeneralRoomExists();

    // Fetch the 50 newest messages in descending order
    const newestFirst = await this.messageRepository.find({
      where: { roomId: generalRoom.id },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    // Reverse so they're oldest -> newest
    return newestFirst.reverse();
  }

  async isPlayerAllowed(
    roomIdentifier: string,
    playerId: string,
  ): Promise<boolean> {
    // Allow everyone in the public "general" room
    if (roomIdentifier === 'general') {
      return true;
    }

    // For all other rooms, check if the user is allowed
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
    return await this.messageRepository.save(message);
  }

  async getPrivateMessages(
    senderId: string,
    receiverId: string,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
