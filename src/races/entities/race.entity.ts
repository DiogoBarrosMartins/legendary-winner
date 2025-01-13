import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('races')
export class Race {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // Example: 'Orc', 'Elf', 'Human', 'Undead'

  @Column({ type: 'jsonb', default: {} })
  traits: { [key: string]: any }; // Race-specific bonuses (e.g., { woodBonus: 10, attackBonus: 5 })

  @Column({ nullable: true })
  description: string; // Optional description of the race
}
