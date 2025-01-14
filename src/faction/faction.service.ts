import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faction } from './entities/faction.entity';
import { HexTileService } from '../hex-tile/hex-tile.service';
import { HexTile, TileState } from '../hex-tile/entities/hex-tile.entity';

@Injectable()
export class FactionService {
  constructor(
    @InjectRepository(Faction)
    private readonly factionRepository: Repository<Faction>,
    private readonly hexTileService: HexTileService,
  ) {}

  async createFaction(name: string, description: string): Promise<Faction> {
    const faction = this.factionRepository.create({
      name,
      description,
    });
    return this.factionRepository.save(faction);
  }

  async getFactionById(factionId: string): Promise<Faction> {
    const faction = await this.factionRepository.findOne({
      where: { id: factionId },
      relations: ['tiles'],
    });
    if (!faction) {
      throw new NotFoundException('Faction not found.');
    }
    return faction;
  }

  async addCity(
    factionId: string,
    cityName: string,
    q: number,
    r: number,
  ): Promise<Faction> {
    const faction = await this.getFactionById(factionId);

    // Initialize cities array if empty
    faction.cities = faction.cities || [];

    faction.cities.push({ name: cityName, q, r });

    // Create tile for the city
    await this.hexTileService.createHexTile(q, r, factionId, TileState.FACTION);

    return this.factionRepository.save(faction);
  }

  async addOutpost(
    factionId: string,
    outpostName: string,
    q: number,
    r: number,
  ): Promise<Faction> {
    const faction = await this.getFactionById(factionId);
    faction.outposts.push({ name: outpostName, q, r });

    // Mark the tile as a faction tile
    await this.hexTileService.createHexTile(q, r, factionId, TileState.FACTION);
    return this.factionRepository.save(faction);
  }

  async updateInfluencePoints(
    factionId: string,
    points: number,
  ): Promise<Faction> {
    const faction = await this.getFactionById(factionId);
    faction.influencePoints += points;
    return this.factionRepository.save(faction);
  }

  async getFactionTerritory(factionId: string): Promise<HexTile[]> {
    return this.hexTileService.getFactionTiles(factionId);
  }
}
