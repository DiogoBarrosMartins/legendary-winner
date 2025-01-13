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
  create(createHexGridDto: CreateHexGridDto) {
    this.logger.log(createHexGridDto);
    return 'This action adds a new hexGrid';
  }

  findAll() {
    return `This action returns all hexGrid`;
  }
  async getTiles(
    hexGridId: string,
    page: number,
    limit: number,
  ): Promise<HexTile[]> {
    const offset = (page - 1) * limit;
    return this.hexTileRepository.find({
      where: { hexGrid: { id: hexGridId } },
      skip: offset,
      take: limit,
    });
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

  findOne(id: number) {
    return `This action returns a #${id} hexGrid`;
  }

  update(id: number, updateHexGridDto: UpdateHexGridDto) {
    this.logger.log(updateHexGridDto);
    return `This action updates a #${id} hexGrid`;
  }

  async deleteGrid(gridId: string): Promise<void> {
    const grid = await this.gridRepository.findOne({ where: { id: gridId } });
    if (!grid) {
      throw new Error('Grid not found.');
    }
    await this.gridRepository.remove(grid);
  }

  async generateGrid(name: string, size: number): Promise<HexGrid> {
    // Ensure no grid with the same name exists
    const existingGrid = await this.gridRepository.findOne({ where: { name } });
    if (existingGrid) {
      throw new Error('A grid with this name already exists.');
    }
  
    // Create a new grid
    const hexGrid = this.gridRepository.create({ name, size });
  
    // Generate tiles for the grid
    const tiles: HexTile[] = [];
    for (let q = -size; q <= size; q++) {
      for (let r = Math.max(-size, -q - size); r <= Math.min(size, -q + size); r++) {
        const tile = this.hexTileRepository.create({
          q,
          r,
          terrain: this.randomTerrain(),
          hexGrid, // Associate with the parent grid
        });
        tiles.push(tile);
      }
    }
  
    // Save tiles and grid
    hexGrid.tiles = tiles;
    return this.gridRepository.save(hexGrid);
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
