import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('villages')
export class Village {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  q: number; // Axial coordinate q

  @Column()
  r: number; // Axial coordinate r

  @Column({ type: 'jsonb', default: [] })
  buildings?: { type: string; level: number }[]; // Example: [{ type: 'farm', level: 1 }]

  @Column({ type: 'jsonb', default: {} }) // Denormalized resources
  resources?: {
    wood: number;
    wheat: number;
    stone: number;
    gold: number;
  };

  @Column({ type: 'jsonb', default: {} }) // Denormalized production rates
  productionRates?: {
    wood: number;
    wheat: number;
    stone: number;
    gold: number;
  };

  @Column()
  hexTile: string; // Link to HexTile (store the HexTile ID)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
}
