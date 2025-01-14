import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HexTile, ResourceType, TileState } from './entities/hex-tile.entity';
import { factions } from '../faction/factions-config';
import { Faction } from '../faction/entities/faction.entity';

@Injectable()
export class HexTileService {
  constructor(
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
    @InjectRepository(Faction)
    private readonly factionRepository: Repository<Faction>,
  ) {}

  async createHexTile(
    q: number,
    r: number,
    factionId?: string,
    tileState: TileState = TileState.NEUTRAL,
  ): Promise<HexTile> {
    console.log(
      `Creating hex tile at (${q}, ${r}) with factionId: ${factionId}`,
    );
    const hexTile = this.hexTileRepository.create({
      q,
      r,
      state: tileState,
      faction: factionId ? { id: factionId } : null,
    });

    const savedTile = await this.hexTileRepository.save(hexTile);
    console.log(`Hex tile created:`, savedTile);
    return savedTile;
  }

  async getTile(q: number, r: number): Promise<HexTile> {
    console.log(`Fetching tile at (${q}, ${r})`);
    const tile = await this.hexTileRepository.findOne({ where: { q, r } });
    if (!tile) {
      console.error(`Tile at (${q}, ${r}) not found.`);
      throw new NotFoundException(`Tile at (${q}, ${r}) not found.`);
    }
    console.log(`Tile found:`, tile);
    return tile;
  }

  async getTilesInRange(
    q: number,
    r: number,
    range: number,
  ): Promise<HexTile[]> {
    console.log(`Fetching tiles in range (${q}, ${r}) with range ${range}`);
    const tiles = await this.hexTileRepository
      .createQueryBuilder('hexTile')
      .where('ABS(hexTile.q - :q) <= :range', { q, range })
      .andWhere('ABS(hexTile.r - :r) <= :range', { r, range })
      .getMany();
    console.log(`Tiles found:`, tiles);
    return tiles;
  }

  async getFactionTiles(factionId: string): Promise<HexTile[]> {
    console.log(`Fetching tiles for factionId: ${factionId}`);
    const tiles = await this.hexTileRepository.find({
      where: { faction: { id: factionId } },
      relations: ['faction'],
    });
    console.log(`Faction tiles found:`, tiles);
    return tiles;
  }

  async assignOwner(q: number, r: number, ownerId: string): Promise<HexTile> {
    console.log(`Assigning owner ${ownerId} to tile at (${q}, ${r})`);
    const tile = await this.getTile(q, r);
    tile.owner.id = ownerId;
    const updatedTile = await this.hexTileRepository.save(tile);
    console.log(`Tile updated with owner:`, updatedTile);
    return updatedTile;
  }
  // Method to delete all tiles from the database
  async deleteAllTiles(): Promise<void> {
    console.log('Deleting all existing tiles...');
    await this.hexTileRepository.clear();
    console.log('All tiles deleted successfully.');
  }
  private async seed(): Promise<void> {
    this.deleteAllTiles();
    console.log(`Seeding factions into the database.`);
    const factionsToSeed = [
      { name: 'Elves', description: 'Graceful beings of the forest' },
      { name: 'Orcs', description: 'Brutal warriors of the wasteland' },
    ];

    for (const faction of factionsToSeed) {
      const exists = await this.factionRepository.findOne({
        where: { name: faction.name },
      });

      if (!exists) {
        console.log(`Seeding faction: ${faction.name}`);
        await this.factionRepository.save(faction);
      } else {
        console.log(`Faction ${faction.name} already exists.`);
      }
    }
  }

  generateMap = async (): Promise<HexTile[]> => {
    console.log('Starting map generation...');
    await this.seed();

    const tiles: HexTile[] = [];
    const occupiedPositions = new Set<string>();
    const mapSize = 10000;

    const databaseFactions = await this.factionRepository.find();
    for (const faction of factions) {
      const dbFaction = databaseFactions.find((f) => f.name === faction.name);
      if (!dbFaction) {
        console.warn(`Faction ${faction.name} not found, skipping.`);
        continue;
      }

      const cityCenter = this.getRandomCityCenter(mapSize);

      this.generateFactionCity(
        faction,
        dbFaction,
        cityCenter,
        tiles,
        occupiedPositions,
      );
      this.generateFactionOutposts(
        faction,
        dbFaction,
        cityCenter,
        tiles,
        occupiedPositions,
      );
      this.generateFactionResources(
        faction,
        dbFaction,
        cityCenter,
        tiles,
        occupiedPositions,
      );
    }

    console.log('Saving tiles to the database...');
    await this.hexTileRepository.save(tiles);
    console.log(`Map generation complete. ${tiles.length} tiles created.`);
    return tiles;
  };

  // Helper Methods

  private getRandomCityCenter(mapSize: number): { q: number; r: number } {
    return {
      q: Math.floor(Math.random() * mapSize - mapSize / 2),
      r: Math.floor(Math.random() * mapSize - mapSize / 2),
    };
  }
  private async generateFactionCity(
    faction: any,
    dbFaction: Faction,
    cityCenter: { q: number; r: number },
    tiles: HexTile[],
    occupiedPositions: Set<string>,
  ): Promise<void> {
    console.log(`Generating city for faction ${faction.name}`);
    for (let i = 0; i < faction.cityTiles; i++) {
      const offsetQ = Math.floor(i / 2);
      const offsetR = i % 2 === 0 ? offsetQ : -offsetQ;

      const q = cityCenter.q + offsetQ;
      const r = cityCenter.r + offsetR;

      const cityTile = this.hexTileRepository.create({
        q,
        r,
        type: 'city',
        faction: dbFaction,
      });

      tiles.push(cityTile);
      this.markPositionAsOccupied(q, r, occupiedPositions);

      // Add to faction's cities array
      dbFaction.cities = [
        ...(dbFaction.cities || []),
        { name: `City ${i + 1}`, q, r },
      ];
    }

    await this.factionRepository.save(dbFaction); // Save faction with updated cities
  }
  private async generateFactionOutposts(
    faction: any,
    dbFaction: Faction,
    cityCenter: { q: number; r: number },
    tiles: HexTile[],
    occupiedPositions: Set<string>,
  ): Promise<void> {
    console.log(`Generating outposts for faction ${faction.name}`);
    const maxRetries = 100;

    for (let i = 0; i < faction.outpostTiles; i++) {
      let q,
        r,
        retries = 0;

      do {
        if (retries++ > maxRetries) {
          console.warn(`Unable to find a position for outpost ${i + 1}.`);
          break;
        }

        q = cityCenter.q + Math.floor(Math.random() * faction.spread);
        r = cityCenter.r + Math.floor(Math.random() * faction.spread);
      } while (this.isPositionOccupied(q, r, occupiedPositions));

      if (retries <= maxRetries) {
        const outpostTile = this.hexTileRepository.create({
          q,
          r,
          type: 'outpost',
          faction: dbFaction,
        });

        tiles.push(outpostTile);
        this.markPositionAsOccupied(q, r, occupiedPositions);

        // Add to faction's outposts array
        dbFaction.outposts = [
          ...(dbFaction.outposts || []),
          { name: `Outpost ${i + 1}`, q, r },
        ];
      }
    }

    await this.factionRepository.save(dbFaction); // Save faction with updated outposts
  }

  private generateFactionResources(
    faction: any,
    dbFaction: Faction,
    cityCenter: { q: number; r: number },
    tiles: HexTile[],
    occupiedPositions: Set<string>,
  ): void {
    console.log(`Generating resources for faction ${faction.name}`);
    const maxRetries = 100; // Maximum retries to prevent infinite loops
    for (let i = 0; i < faction.resourceTiles; i++) {
      let q,
        r,
        retries = 0;
      do {
        if (retries++ > maxRetries) {
          console.warn(
            `Unable to find a position for resource ${i + 1} for faction ${faction.name}.`,
          );
          break;
        }
        q = cityCenter.q + Math.floor(Math.random() * faction.spread * 2);
        r = cityCenter.r + Math.floor(Math.random() * faction.spread * 2);
      } while (this.isPositionOccupied(q, r, occupiedPositions));

      if (retries <= maxRetries) {
        const resourceFields = this.generateResourceFields(4).map((type) => ({
          type,
          level: 0,
          baseProduction: 10,
          maxCapacity: 1000,
          upgradeCost: { wood: 50, clay: 50, iron: 50, grain: 50 },
        }));

        this.createTile(
          q,
          r,
          'resource',
          dbFaction,
          resourceFields,
          tiles,
          occupiedPositions,
        );
      }
    }
  }

  private generateResourceFields(count: number): ResourceType[] {
    return (['wood', 'clay', 'iron', 'grain'] as ResourceType[])
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }

  private createTile(
    q: number,
    r: number,
    type: 'city' | 'outpost' | 'resource',
    faction: Faction,
    resourceFields: any[],
    tiles: HexTile[],
    occupiedPositions: Set<string>,
  ): void {
    if (!this.isPositionOccupied(q, r, occupiedPositions)) {
      tiles.push(
        this.hexTileRepository.create({
          q,
          r,
          type,
          faction,
          resourceFields,
        }),
      );
      this.markPositionAsOccupied(q, r, occupiedPositions);
    }
  }

  private isPositionOccupied(
    q: number,
    r: number,
    occupiedPositions: Set<string>,
  ): boolean {
    return occupiedPositions.has(`${q},${r}`);
  }

  private markPositionAsOccupied(
    q: number,
    r: number,
    occupiedPositions: Set<string>,
  ): void {
    occupiedPositions.add(`${q},${r}`);
  }

  async updateTileYields(
    q: number,
    r: number,
    yields: Partial<HexTile>,
  ): Promise<HexTile> {
    console.log(`Updating yields for tile at (${q}, ${r}) with data:`, yields);
    const tile = await this.getTile(q, r);
    Object.assign(tile, yields);
    const updatedTile = await this.hexTileRepository.save(tile);
    console.log(`Tile yields updated:`, updatedTile);
    return updatedTile;
  }
}
