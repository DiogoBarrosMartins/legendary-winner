import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { HexTile } from './hex-tile.entity';

@Entity('grids')
export class HexGrid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // Optional: Name for the grid

  @Column()
  size: number; // Grid radius or size

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => HexTile, (tile) => tile.hexGrid, { cascade: true })
  tiles: HexTile[];
}
