import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faction } from './entities/faction.entity';
import { HexTileService } from '../hex-tile/hex-tile.service';
import { HexTile, TileState } from '../hex-tile/entities/hex-tile.entity';
// Import the faction configuration and alias it to avoid naming conflicts.
import { factions as factionsConfig } from './factions-config';

@Injectable()
export class FactionService {
  logger: Logger = new Logger(FactionService.name);
  constructor(
    @InjectRepository(Faction)
    private readonly factionRepository: Repository<Faction>,
    private readonly hexTileService: HexTileService,
  ) {}

  // Create a new faction with initial empty arrays and 0 influence points.
  async createFaction(name: string, description: string): Promise<Faction> {
    const faction = this.factionRepository.create({
      name,
      description,
      influencePoints: 0,
      cities: [],
      outposts: [],
      resourceVillages: [],
    });
    return this.factionRepository.save(faction);
  }

  async getFactionById(factionId: string): Promise<Faction> {
    const faction = await this.factionRepository.findOne({
      where: { id: factionId },
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

    // Check if the tile is available (assumes getTile throws if not found)
    let existingTile;
    try {
      existingTile = await this.hexTileService.getTile(q, r);
    } catch (error) {
      this.logger.log(
        `Tile not found in a good way, at  (${q}, ${r}) continuing `,
        error,
      );
      // If not found, that's okay.
    }
    if (existingTile) {
      throw new Error(`Tile at (${q}, ${r}) is already occupied.`);
    }

    // If there's an existing central city, enforce a maximum distance.
    if (faction.cities && faction.cities.length > 0) {
      const centralCity = faction.cities[0];
      const distance = this.calculateDistance(
        q,
        r,
        centralCity.q,
        centralCity.r,
      );
      const reinforcementRange = 10; // Example limit
      if (distance > reinforcementRange) {
        throw new Error(
          `City must be within ${reinforcementRange} tiles of the central city.`,
        );
      }
    }

    // Create the hex tile for the city.
    await this.hexTileService.createHexTile(q, r, factionId, TileState.FACTION);

    // Calculate base production rates.
    // Base production values (could be adjusted per game design)
    const baseProduction = { wood: 10, wheat: 15, stone: 5, gold: 3 };

    // Get adjacent tiles (range 1) and count those that are resource tiles.
    const adjacentTiles = await this.hexTileService.getTilesInRange(q, r, 1);
    const resourceCount = adjacentTiles.filter(
      (tile) => tile.type === 'resource',
    ).length;

    // Adjust production rates based on the number of adjacent resource tiles.
    const productionRates = {
      wood: baseProduction.wood + resourceCount * 2,
      wheat: baseProduction.wheat + resourceCount * 2,
      stone: baseProduction.stone + resourceCount * 1,
      gold: baseProduction.gold + resourceCount * 1,
    };

    // Add the city data to the faction's cities array.
    faction.cities = faction.cities || [];
    faction.cities.push({ name: cityName, q, r, productionRates });

    return this.factionRepository.save(faction);
  }

  // Add an outpost to the faction. Similar to addCity.
  async addOutpost(
    factionId: string,
    outpostName: string,
    q: number,
    r: number,
  ): Promise<Faction> {
    const faction = await this.getFactionById(factionId);

    let existingTile;
    try {
      existingTile = await this.hexTileService.getTile(q, r);
    } catch (error) {
      this.logger.error('Tile not found', error);
    }

    if (existingTile) {
      throw new Error(`Tile at (${q}, ${r}) is already occupied.`);
    }

    await this.hexTileService.createHexTile(q, r, factionId, TileState.FACTION);
    faction.outposts = faction.outposts || [];
    faction.outposts.push({ name: outpostName, q, r });
    return this.factionRepository.save(faction);
  }

  // Update the influence points for a faction.
  async updateInfluencePoints(
    factionId: string,
    points: number,
  ): Promise<Faction> {
    const faction = await this.getFactionById(factionId);
    faction.influencePoints = (faction.influencePoints || 0) + points;
    return this.factionRepository.save(faction);
  }

  // Retrieve all hex tiles (territory) that belong to the faction.
  async getFactionTerritory(factionId: string): Promise<HexTile[]> {
    return this.hexTileService.getFactionTiles(factionId);
  }

  // Spawn faction villages: central city, outposts, and resource villages.
  async spawnFactionVillages(factionId: string): Promise<Faction> {
    const faction = await this.getFactionById(factionId);
    if (!faction) {
      throw new NotFoundException('Faction not found.');
    }

    // Determine a random city center for this faction.
    const cityCenter = {
      q: Math.floor(Math.random() * 100 - 50),
      r: Math.floor(Math.random() * 100 - 50),
    };

    faction.cities = faction.cities || [];
    faction.outposts = faction.outposts || [];
    faction.resourceVillages = faction.resourceVillages || [];

    // Create the central city tile.
    await this.hexTileService.createHexTile(
      cityCenter.q,
      cityCenter.r,
      factionId,
      TileState.FACTION,
    );
    faction.cities.push({
      name: `${faction.name} Capital`,
      q: cityCenter.q,
      r: cityCenter.r,
    });

    // Retrieve faction configuration.
    const config = factionsConfig.find((f) => f.name === faction.name);
    if (!config) {
      throw new Error(`No configuration found for faction ${faction.name}`);
    }

    // Generate outposts.
    for (let i = 0; i < config.outpostTiles; i++) {
      const offsetQ = Math.floor(Math.random() * config.spread);
      const offsetR = Math.floor(Math.random() * config.spread);
      const q = cityCenter.q + offsetQ;
      const r = cityCenter.r + offsetR;
      await this.hexTileService.createHexTile(
        q,
        r,
        factionId,
        TileState.FACTION,
      );
      faction.outposts.push({ name: `${faction.name} Outpost ${i + 1}`, q, r });
    }

    // Generate resource villages.
    for (let i = 0; i < config.resourceTiles; i++) {
      const offsetQ =
        Math.floor(Math.random() * config.spread * 2) - config.spread;
      const offsetR =
        Math.floor(Math.random() * config.spread * 2) - config.spread;
      const q = cityCenter.q + offsetQ;
      const r = cityCenter.r + offsetR;
      await this.hexTileService.createHexTile(
        q,
        r,
        factionId,
        TileState.NEUTRAL,
      );
      faction.resourceVillages.push({
        name: `${faction.name} Resource ${i + 1}`,
        q,
        r,
      });
    }

    // Optionally update influence points.
    faction.influencePoints += 10;

    return this.factionRepository.save(faction);
  }

  private calculateDistance(
    q1: number,
    r1: number,
    q2: number,
    r2: number,
  ): number {
    const s1 = -q1 - r1;
    const s2 = -q2 - r2;
    return Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(s1 - s2));
  }
}
