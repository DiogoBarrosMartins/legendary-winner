import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { HexGrid } from './hex-grid.entity';
import { User } from '../../users/entities/user.entity';
import { Village } from '../../villages/entities/village.entity';

@Entity()
export class HexTile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  q: number;

  @Column()
  r: number;
  @ManyToOne(() => User, (user) => user.claimedTiles, { nullable: true })
  owner: User; // Player who owns this tile

  @Column()
  terrain: string;

  @Column({ nullable: true })
  faction: string; // Example: 'Orc', 'Human', 'Elf', 'Undead'

  @Column({ default: 'neutral' })
  zoneType: string; // 'faction', 'contested', 'neutral'
  @ManyToOne(() => HexGrid, (grid) => grid.tiles)
  hexGrid: HexGrid;
  @OneToOne(() => Village, (village) => village.hexTile, { nullable: true })
  @JoinColumn()
  village: Village; // The village located on this tile
}
