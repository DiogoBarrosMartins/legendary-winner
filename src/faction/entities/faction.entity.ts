import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('factions')
export class Faction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;
  // New column to track influence points.
  @Column({ default: 0 })
  influencePoints: number;

  @Column({ type: 'jsonb', nullable: true })
  cities: {
    name: string;
    q: number;
    r: number;
    productionRates?: {
      wood: number;
      wheat: number;
      stone: number;
      gold: number;
    };
  }[];

  @Column({ type: 'jsonb', nullable: true })
  outposts: { name: string; q: number; r: number }[];

  @Column({ type: 'jsonb', nullable: true })
  resourceVillages: { name: string; q: number; r: number }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
