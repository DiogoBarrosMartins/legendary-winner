import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HexTile } from '../../hex-tile/entities/hex-tile.entity';

@Entity('factions')
export class Faction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column({ default: 0 })
  influencePoints: number;

  @OneToMany(() => HexTile, (hexTile) => hexTile.faction)
  tiles: HexTile[];

  @Column('simple-json', { default: [] })
  cities: { name: string; q: number; r: number }[]; // Central cities for faction

  @Column('simple-json', { default: [] })
  outposts: { name: string; q: number; r: number }[]; // Outposts providing reinforcements

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
