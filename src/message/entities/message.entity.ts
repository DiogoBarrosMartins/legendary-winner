import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  @Entity('messages')
  export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    senderId: string;
  
    @Column({ nullable: true }) // Nullable for global messages
    receiverId?: string;
  
    @Column({ nullable: true }) // Nullable for non-faction messages
    factionId?: string;
  
    @Column({ nullable: true }) // Nullable for optional room association
    roomId?: string;
  
    @Column()
    content: string;
  
    @Column()
    chatType: 'global' | 'private' | 'faction';
  
    @CreateDateColumn()
    createdAt: Date;
  }
  