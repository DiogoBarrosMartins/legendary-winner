import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Village } from '../../villages/entities/village.entity';
import { Faction } from '../../faction/entities/faction.entity';
import { User } from '../../users/entities/user.entity';

export enum TileState {
  NEUTRAL = 'neutral',
  OCCUPIED = 'occupied',
  CONTESTED = 'contested',
  FACTION = 'faction',
}
export type ResourceType = 'wood' | 'clay' | 'iron' | 'grain' | 'gold';

export interface ResourceField {
  type: ResourceType;
  level: number; // 0 to 10
  baseProduction: number; // Per hour
  maxCapacity: number; // Resources it can store
  upgradeCost: Record<ResourceType, number>; // Cost to upgrade
}

@Entity('hex_tiles')
export class HexTile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  type: 'city' | 'outpost' | 'resource' | 'pvp';

  @Column('int')
  q: number; // Axial coordinate q

  @Column('int')
  r: number; // Axial coordinate r

  @Column({ type: 'enum', enum: TileState, default: TileState.NEUTRAL })
  state: TileState;

  @ManyToOne(() => User, (user) => user.claimedTiles, { nullable: true })
  owner: User;

  @ManyToOne(() => Faction, (faction) => faction.tiles, {
    nullable: true,
    eager: true,
  })
  faction: Faction;

  @OneToMany(() => Village, (village) => village.hexTile, { nullable: true })
  villages: Village[];

  @Column({ type: 'jsonb', nullable: true })
  resourceFields: {
    type: ResourceType;
    level: number;
    baseProduction: number;
    maxCapacity: number;
    upgradeCost: Record<ResourceType, number>;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
