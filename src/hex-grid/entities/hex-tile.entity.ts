import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { HexGrid } from './hex-grid.entity';
import { User } from '../../users/entities/user.entity';

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

  @ManyToOne(() => HexGrid, (grid) => grid.tiles)
  hexGrid: HexGrid;
}
