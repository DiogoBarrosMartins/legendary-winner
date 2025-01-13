import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { HexTile } from '../../hex-grid/entities/hex-tile.entity';

@Entity('villages')
export class Village {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => HexTile, (tile) => tile.village, { onDelete: 'CASCADE' })
  hexTile: HexTile; // The tile where this village is located

  @Column({ type: 'jsonb', default: [] })
  buildings: { type: string; level: number }[]; // Example: [{ type: 'farm', level: 1 }]

  @Column({ type: 'jsonb', default: {} })
  resources: { [key: string]: number }; // Current stored resources (e.g., { wood: 100, stone: 50 })

  @Column({ type: 'jsonb', default: {} })
  productionRates: { [key: string]: number }; // Resource production per hour
}
