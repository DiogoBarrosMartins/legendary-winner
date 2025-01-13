import { Injectable, Logger } from '@nestjs/common';
import { HexTile } from './entities/hex-tile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHexGridDto } from './dto/create-hex-grid.dto';
import { UpdateHexGridDto } from './dto/update-hex-grid.dto';
import { HexGrid } from './entities/hex-grid.entity';
@Injectable()
export class HexGridService {
  logger = new Logger('HexGridService');
  constructor(
    @InjectRepository(HexTile)
  private readonly hexTileRepository: Repository<HexTile>,
  @InjectRepository(HexGrid)
  private readonly gridRepository: Repository<HexGrid>,
  ) {}
  
  async generateGrid(name: string, size: number): Promise<HexGrid> {
    const hexGrid = this.gridRepository.create({ name, size });
    const savedGrid = await this.gridRepository.save(hexGrid);
  
    const tiles: HexTile[] = [];
    for (let q = -size; q <= size; q++) {
      for (let r = Math.max(-size, -q - size); r <= Math.min(size, -q + size); r++) {
        const tileType = this.getZoneType(q, r);
        const tileFaction = this.getFactionByZone(tileType);
  
        const tile = this.hexTileRepository.create({
          q,
          r,
          terrain: this.randomTerrain(),
          hexGrid: savedGrid,
          faction: tileFaction,
          zoneType: tileType,
        });
        tiles.push(tile);
      }
    }
  
    await this.hexTileRepository.save(tiles);
    return savedGrid;
  }
  
  // Determine zone type by position
  private getZoneType(q: number, r: number): string {
    const distanceFromCenter = Math.sqrt(q * q + r * r);
    if (distanceFromCenter < 5) return 'faction';
    if (distanceFromCenter < 10) return 'contested';
    return 'neutral';
  }
  
  // Assign faction to zones
  private getFactionByZone(zoneType: string): string | null {
    if (zoneType === 'faction') {
      const factions = ['Orc', 'Human', 'Elf', 'Undead'];
      return factions[Math.floor(Math.random() * factions.length)];
    }
    return null; // Neutral for non-faction zones
  }
  

  async findAll(): Promise<HexGrid[]> {
    return this.gridRepository.find({ relations: ['tiles'] });
  }

  async getGridById(gridId: string): Promise<HexGrid> {
    const grid = await this.gridRepository.findOne({
      where: { id: gridId },
      relations: ['tiles'],
    });
    if (!grid) {
      throw new Error('Grid not found.');
    }
    return grid;
  }

  async getTiles(gridId: string, page: number, limit: number): Promise<HexTile[]> {
    const offset = (page - 1) * limit;
    return this.hexTileRepository.find({
      where: { hexGrid: { id: gridId } },
      skip: offset,
      take: limit,
    });
  }

  async update(gridId: string, updateHexGridDto: Record<string, any>): Promise<HexGrid> {
    const grid = await this.gridRepository.findOne({ where: { id: gridId } });
    if (!grid) {
      throw new Error('Grid not found.');
    }

    Object.assign(grid, updateHexGridDto);
    return this.gridRepository.save(grid);
  }

  async deleteGrid(gridId: string): Promise<void> {
    const grid = await this.gridRepository.findOne({ where: { id: gridId } });
    if (!grid) {
      throw new Error('Grid not found.');
    }
    await this.gridRepository.remove(grid);
  }

  private randomTerrain(): string {
    const terrains = ['grassland', 'forest', 'mountain', 'water'];
    return terrains[Math.floor(Math.random() * terrains.length)];
  }

  async getAdjacentTilesFromDB(q: number, r: number): Promise<HexTile[]> {
    const directions = [
      [+1, 0],
      [0, +1],
      [-1, +1],
      [-1, 0],
      [0, -1],
      [+1, -1],
    ];

    const adjacentCoords = directions.map(([dq, dr]) => ({
      q: q + dq,
      r: r + dr,
    }));

    return this.hexTileRepository.find({
      where: adjacentCoords,
    });
  }
}
