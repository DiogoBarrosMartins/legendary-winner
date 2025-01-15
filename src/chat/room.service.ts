import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
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

  async isPlayerAllowed(roomIdentifier: string, playerId: string): Promise<boolean> {
    const room = await this.roomRepository.findOne({ where: { identifier: roomIdentifier } });
    if (!room) {
      throw new NotFoundException(`Room with identifier ${roomIdentifier} not found`);
    }
    return room.allowedPlayerIds.includes(playerId);
  }
}
