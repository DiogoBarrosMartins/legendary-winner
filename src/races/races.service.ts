import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from './entities/race.entity';

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
    private readonly raceRepository: Repository<Race>,
  ) {}

  // Create a race
  async createRace(
    name: string,
    traits: Record<string, any>,
    description?: string,
  ): Promise<Race> {
    const race = this.raceRepository.create({ name, traits, description });
    return this.raceRepository.save(race);
  }

  // Fetch all races
  async findAll(): Promise<Race[]> {
    return this.raceRepository.find();
  }

  // Fetch a race by ID
  async findOne(id: string): Promise<Race> {
    const race = await this.raceRepository.findOne({ where: { id } });
    if (!race) {
      throw new Error('Race not found.');
    }
    return race;
  }
}
