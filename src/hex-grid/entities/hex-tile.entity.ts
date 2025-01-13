import { User } from 'src/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { HexGrid } from './hex-grid.entity';

@Entity('hex_tiles')
export class HexTile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  q: number; // Axial coordinate q

  @Column()
  r: number; // Axial coordinate r

  @Column({ default: 'grassland' })
  terrain: string; // Terrain type (grassland, forest, mountain, etc.)

  @Column({ default: 0 })
  resources: number; // Resources available on the tile

  @ManyToOne(() => User, (user) => user.claimedTiles, { nullable: true })
  owner: User; // Player who owns this tile

  @ManyToOne(() => HexGrid, (hexGrid) => hexGrid.tiles, { onDelete: 'CASCADE' })
  hexGrid: HexGrid; // Parent grid relationship
}
