export class Resource {}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Village } from '../../villages/entities/village.entity';

@Entity('resources')
export class Resources {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', default: 0 })
  wood: number;

  @Column({ type: 'float', default: 0 })
  wheat: number;

  @Column({ type: 'float', default: 0 })
  stone: number;

  @Column({ type: 'float', default: 0 })
  gold: number;

  @ManyToOne(() => Village, (village) => village.resources, {
    onDelete: 'CASCADE',
  })
  village: Village;
}
