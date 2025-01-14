import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Village } from './entities/village.entity';
import { HexTile } from '../hex-tile/entities/hex-tile.entity';
import { Resource, Resources } from '../resources/entities/resource.entity';

@Injectable()
export class VillagesService {
  logger: Logger = new Logger('VillagesService');
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
    @InjectRepository(HexTile)
    private readonly resourcesRepository: Repository<Resource>,
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
    });

    return this.villageRepository.save(village);
  }

  // Upgrade a building in the village
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

  // Collect resources
  async collectResources(villageId: string): Promise<Village> {
    const village = await this.getVillageById(villageId);

    // Calculate resources based on production rates
    Object.keys(village.productionRates).forEach((resource) => {
      village.resources[resource] += village.productionRates[resource];
    });

    return this.villageRepository.save(village);
  }
  async getAvailableResources(villageId: string): Promise<Resources> {
    const village = await this.getVillageById(villageId);
    return village.resources[0]; // Assuming one resource entity per village
  }

  async updateVillageResources(villageId: string): Promise<void> {
    const village = await this.getVillageById(villageId);
    const resources = village.resources[0];

    const now = new Date();
    const lastUpdated = new Date(village.lastUpdated);
    const minutesElapsed = Math.floor(
      (now.getTime() - lastUpdated.getTime()) / 60000,
    );

    if (minutesElapsed > 0) {
      const updatedResources = this.calculateResourceProduction(
        village,
        minutesElapsed,
      );

      resources.wood += updatedResources.wood;
      resources.wheat += updatedResources.wheat;
      resources.stone += updatedResources.stone;
      resources.gold += updatedResources.gold;

      await this.resourcesRepository.save(resources);

      village.lastUpdated = now;
      await this.villageRepository.save(village);
    }
  }

  private calculateResourceProduction(
    village: Village,
    minutesElapsed: number,
  ): Partial<Resources> {
    const productionRates = this.calculateProductionRates(village);

    return {
      wood: productionRates.wood * minutesElapsed,
      wheat: productionRates.wheat * minutesElapsed,
      stone: productionRates.stone * minutesElapsed,
      gold: productionRates.gold * minutesElapsed,
    };
  }

  private calculateProductionRates(village: Village): Partial<Resources> {
    const buildings = village.resources; // Link with buildings for production rates
    this.logger.log(buildings);
    return {
      wood: 10, // Adjust based on actual building logic
      wheat: 15,
      stone: 5,
      gold: 3,
    };
  }

  async hasEnoughResources(
    villageId: string,
    requiredResources: Partial<Resources>,
  ): Promise<boolean> {
    const resources = await this.getAvailableResources(villageId);

    return (
      resources.wood >= (requiredResources.wood || 0) &&
      resources.wheat >= (requiredResources.wheat || 0) &&
      resources.stone >= (requiredResources.stone || 0) &&
      resources.gold >= (requiredResources.gold || 0)
    );
  }

  async deductResources(
    villageId: string,
    resourcesToDeduct: Partial<Resources>,
  ): Promise<void> {
    const village = await this.getVillageById(villageId);
    const resources = village.resources[0];

    if (resourcesToDeduct.wood && resources.wood < resourcesToDeduct.wood) {
      throw new Error('Not enough wood.');
    }
    if (resourcesToDeduct.wheat && resources.wheat < resourcesToDeduct.wheat) {
      throw new Error('Not enough wheat.');
    }
    if (resourcesToDeduct.stone && resources.stone < resourcesToDeduct.stone) {
      throw new Error('Not enough stone.');
    }
    if (resourcesToDeduct.gold && resources.gold < resourcesToDeduct.gold) {
      throw new Error('Not enough gold.');
    }

    resources.wood -= resourcesToDeduct.wood || 0;
    resources.wheat -= resourcesToDeduct.wheat || 0;
    resources.stone -= resourcesToDeduct.stone || 0;
    resources.gold -= resourcesToDeduct.gold || 0;

    await this.resourcesRepository.save(resources);
  }

  async getVillageById(villageId: string): Promise<Village> {
    const village = await this.villageRepository.findOne({
      where: { id: villageId },
      relations: ['resources'],
    });
    if (!village) {
      throw new NotFoundException('Village not found.');
    }
    return village;
  }
}
