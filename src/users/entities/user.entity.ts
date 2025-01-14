import { HexTile } from '../../hex-tile/entities/hex-tile.entity';
import { Race } from '../../races/entities/race.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  resetToken: string;

  @OneToMany(() => HexTile, (tile) => tile.owner)
  claimedTiles: HexTile[]; // Tiles claimed by the player

  @ManyToOne(() => Race, { nullable: true })
  race: Race; // Player's chosen race
}
