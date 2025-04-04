import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Village } from './entities/village.entity';
import { HexTile } from '../hex-tile/entities/hex-tile.entity';

@Injectable()
export class VillagesService {
  private readonly logger = new Logger('VillagesService');
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
  ) {}

  async createVillage(tileId: string, name: string): Promise<Village> {
    const hexTile = await this.hexTileRepository.findOne({
      where: { id: tileId },
    });
    if (!hexTile) {
      throw new NotFoundException('Tile not found.');
    }

    const village = this.villageRepository.create({
      name,
      q: hexTile.q,
      r: hexTile.r,
      hexTile: hexTile.id,
      resources: { wood: 1000, wheat: 1000, stone: 500, gold: 500 },
      productionRates: { wood: 10, wheat: 15, stone: 5, gold: 3 },
      lastUpdated: new Date(),
      buildings: [],
    });

    return this.villageRepository.save(village);
  }

  async upgradeBuilding(
    villageId: string,
    buildingType: string,
  ): Promise<Village> {
    const village = await this.getVillageById(villageId);

    const building = village.buildings.find((b) => b.type === buildingType);
    if (!building) {
      village.buildings.push({ type: buildingType, level: 1 });
    } else {
      building.level += 1;
    }

    return this.villageRepository.save(village);
  }

  async collectResources(villageId: string): Promise<Village> {
    const village = await this.getVillageById(villageId);
    // Add production rates to resources for each resource type.
    for (const resource of Object.keys(village.productionRates)) {
      village.resources[resource] += village.productionRates[resource];
    }
    return this.villageRepository.save(village);
  }

  async getAvailableResources(
    villageId: string,
  ): Promise<{ wood: number; wheat: number; stone: number; gold: number }> {
    const village = await this.getVillageById(villageId);
    return village.resources;
  }

  async updateVillageResources(villageId: string): Promise<Village> {
    const village = await this.getVillageById(villageId);
    const now = new Date();
    const lastUpdated = new Date(village.lastUpdated);
    const minutesElapsed = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 60000,
    );
    if (minutesElapsed > 0) {
      const production = this.calculateResourceProduction(
        village,
        minutesElapsed,
      );
      village.resources.wood += production.wood;
      village.resources.wheat += production.wheat;
      village.resources.stone += production.stone;
      village.resources.gold += production.gold;
      village.lastUpdated = now;
      return this.villageRepository.save(village);
    }
    return village;
  }

  private calculateResourceProduction(
    village: Village,
    minutesElapsed: number,
  ): { wood: number; wheat: number; stone: number; gold: number } {
    const rates = village.productionRates;
    return {
      wood: rates.wood * minutesElapsed,
      wheat: rates.wheat * minutesElapsed,
      stone: rates.stone * minutesElapsed,
      gold: rates.gold * minutesElapsed,
    };
  }

  async hasEnoughResources(
    villageId: string,
    required: { wood?: number; wheat?: number; stone?: number; gold?: number },
  ): Promise<boolean> {
    const village = await this.getVillageById(villageId);
    return (
      village.resources.wood >= (required.wood || 0) &&
      village.resources.wheat >= (required.wheat || 0) &&
      village.resources.stone >= (required.stone || 0) &&
      village.resources.gold >= (required.gold || 0)
    );
  }

  async deductResources(
    villageId: string,
    cost: { wood?: number; wheat?: number; stone?: number; gold?: number },
  ): Promise<Village> {
    const village = await this.getVillageById(villageId);
    if (cost.wood && village.resources.wood < cost.wood) {
      throw new Error('Not enough wood.');
    }
    if (cost.wheat && village.resources.wheat < cost.wheat) {
      throw new Error('Not enough wheat.');
    }
    if (cost.stone && village.resources.stone < cost.stone) {
      throw new Error('Not enough stone.');
    }
    if (cost.gold && village.resources.gold < cost.gold) {
      throw new Error('Not enough gold.');
    }

    village.resources.wood -= cost.wood || 0;
    village.resources.wheat -= cost.wheat || 0;
    village.resources.stone -= cost.stone || 0;
    village.resources.gold -= cost.gold || 0;

    return this.villageRepository.save(village);
  }

  async getVillageById(villageId: string): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id: villageId },
    });
    if (!village) {
      throw new NotFoundException('Village not found.');
    }
    return village;
  }
}
