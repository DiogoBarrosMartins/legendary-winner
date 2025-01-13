import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Village } from './entities/village.entity';
import { HexTile } from '../hex-grid/entities/hex-tile.entity';

@Injectable()
export class VillagesService {
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
  ) {}

  // Create a new village
  async createVillage(tileId: string, name: string): Promise<Village> {
    const hexTile = await this.hexTileRepository.findOne({ where: { id: tileId }, relations: ['village'] });

    if (!hexTile) {
      throw new NotFoundException('Tile not found.');
    }

    if (hexTile.village) {
      throw new Error('This tile already has a village.');
    }

    const village = this.villageRepository.create({
      name,
      hexTile,
      resources: { wood: 0, stone: 0, food: 0, gold: 0 },
      productionRates: { wood: 10, stone: 5, food: 15 },
      buildings: [],
    });

    return this.villageRepository.save(village);
  }

  // Get village by ID
  async getVillageById(id: string): Promise<Village> {
    const village = await this.villageRepository.findOne({ where: { id }, relations: ['hexTile'] });
    if (!village) {
      throw new NotFoundException('Village not found.');
    }
    return village;
  }

  // Upgrade a building in the village
  async upgradeBuilding(villageId: string, buildingType: string): Promise<Village> {
    const village = await this.getVillageById(villageId);

    const building = village.buildings.find((b) => b.type === buildingType);
    if (!building) {
      village.buildings.push({ type: buildingType, level: 1 });
    } else {
      building.level += 1;
    }

    // Optionally adjust production rates
    if (buildingType === 'farm') {
      village.productionRates.food += 10;
    } else if (buildingType === 'lumbermill') {
      village.productionRates.wood += 5;
    }

    return this.villageRepository.save(village);
  }

  // Collect resources
  async collectResources(villageId: string): Promise<Village> {
    const village = await this.getVillageById(villageId);

    // Calculate resources based on production rates
    Object.keys(village.productionRates).forEach((resource) => {
      village.resources[resource] += village.productionRates[resource];
    });

    return this.villageRepository.save(village);
  }
}
