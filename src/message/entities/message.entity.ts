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

  @Column()
  senderName: string; // Added field for the sender's name

  @Column({ nullable: true }) // Nullable for global messages
  receiverId?: string;

  @Column({ nullable: true }) // Nullable for optional room association
  roomId?: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
