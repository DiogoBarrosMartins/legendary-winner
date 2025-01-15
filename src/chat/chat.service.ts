import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../message/entities/message.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async saveMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return this.messageRepository.save(message);
  }

  async getMessagesByFaction(factionId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { factionId },
      order: { createdAt: 'ASC' },
    });
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
