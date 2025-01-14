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
    const hexTile = this.hexTileRepository.create({
      q,
      r,
      state: tileState,
      faction: factionId ? { id: factionId } : null,
    });

    return this.hexTileRepository.save(hexTile);
  }

  async getTile(q: number, r: number): Promise<HexTile> {
    const tile = await this.hexTileRepository.findOne({ where: { q, r } });
    if (!tile) {
      throw new NotFoundException(`Tile at (${q}, ${r}) not found.`);
    }
    return tile;
  }

  async getTilesInRange(
    q: number,
    r: number,
    range: number,
  ): Promise<HexTile[]> {
    return this.hexTileRepository
      .createQueryBuilder('hexTile')
      .where('ABS(hexTile.q - :q) <= :range', { q, range })
      .andWhere('ABS(hexTile.r - :r) <= :range', { r, range })
      .getMany();
  }
  async getFactionTiles(factionId: string): Promise<HexTile[]> {
    return this.hexTileRepository.find({
      where: { faction: { id: factionId } },
      relations: ['faction'],
    });
  }

  async assignOwner(q: number, r: number, ownerId: string): Promise<HexTile> {
    const tile = await this.getTile(q, r);
    tile.owner.id = ownerId;
    return this.hexTileRepository.save(tile);
  }
  generateMap = async (): Promise<HexTile[]> => {
    const tiles: HexTile[] = [];
    const mapSize = 100; // Define overall map size (100x100 hexes)

    // Utility: Check if a position is already occupied
    const isPositionOccupied = (q: number, r: number): boolean =>
      tiles.some((tile) => tile.q === q && tile.r === r);

    // Utility: Generate random resource fields
    const generateResourceFields = (count: number): ResourceType[] =>
      (['wood', 'clay', 'iron', 'grain'] as ResourceType[])
        .sort(() => 0.5 - Math.random())
        .slice(0, count);

    // Generate tiles for each faction
    for (const faction of factions) {
      let factionTiles = 0;

      // Generate faction city (multi-hex cluster)
      const cityCenter = {
        q: Math.floor(Math.random() * mapSize - mapSize / 2),
        r: Math.floor(Math.random() * mapSize - mapSize / 2),
      };

      for (let i = 0; i < faction.cityTiles; i++) {
        const offsetQ = Math.floor(i / 2);
        const offsetR = i % 2 === 0 ? offsetQ : -offsetQ;

        if (
          !isPositionOccupied(cityCenter.q + offsetQ, cityCenter.r + offsetR)
        ) {
          tiles.push(
            this.hexTileRepository.create({
              q: cityCenter.q + offsetQ,
              r: cityCenter.r + offsetR,
              type: 'city',
              faction: await this.factionRepository.findOneBy({
                id: faction.id,
              }),
              resourceFields: [],
            }),
          );
        }
      }

      factionTiles += faction.cityTiles;

      // Generate faction outposts
      for (let i = 0; i < faction.outpostTiles; i++) {
        let q, r;
        do {
          q = cityCenter.q + Math.floor(Math.random() * faction.spread);
          r = cityCenter.r + Math.floor(Math.random() * faction.spread);
        } while (isPositionOccupied(q, r));

        tiles.push(
          this.hexTileRepository.create({
            q,
            r,
            type: 'outpost',
            faction: await this.factionRepository.findOneBy({ id: faction.id }),
            resourceFields: [],
          }),
        );

        factionTiles++;
      }

      // Generate faction resource tiles
      for (let i = 0; i < faction.resourceTiles; i++) {
        let q, r;
        do {
          q = cityCenter.q + Math.floor(Math.random() * faction.spread * 2);
          r = cityCenter.r + Math.floor(Math.random() * faction.spread * 2);
        } while (isPositionOccupied(q, r));

        const resources = generateResourceFields(4);
        tiles.push(
          this.hexTileRepository.create({
            q,
            r,
            type: 'resource',
            faction: await this.factionRepository.findOneBy({ id: faction.id }),
            resourceFields: resources.map((type) => ({
              type,
              level: 0,
              baseProduction: 10,
              maxCapacity: 1000,
              upgradeCost: { wood: 50, clay: 50, iron: 50, grain: 50 },
            })),
          }),
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        factionTiles++;
      }
    }

    // Save all tiles to the database
    return await this.hexTileRepository.save(tiles);
  };

  async updateTileYields(
    q: number,
    r: number,
    yields: Partial<HexTile>,
  ): Promise<HexTile> {
    const tile = await this.getTile(q, r);
    Object.assign(tile, yields);
    return this.hexTileRepository.save(tile);
  }
}
