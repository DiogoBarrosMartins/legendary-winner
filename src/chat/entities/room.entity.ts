import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: false, default: 'default_identifier' })
  identifier: string;

  @Column({ type: 'jsonb', default: [] })
  allowedPlayerIds: string[];
  @CreateDateColumn()
  createdAt: Date;
}
