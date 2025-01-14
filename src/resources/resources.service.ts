import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Village } from '../villages/entities/village.entity';
import { Resources } from './entities/resource.entity';
import { HexTile } from '../hex-tile/entities/hex-tile.entity';

@Injectable()
export class ResourcesService {
  logger: Logger = new Logger('ResourcesService');
  constructor(
    @InjectRepository(Village)
    private readonly villageRepository: Repository<Village>,
    @InjectRepository(HexTile)
    private readonly hexTileRepository: Repository<HexTile>,
    @InjectRepository(Resources)
    private readonly resourcesRepository: Repository<Resources>, // Correctly inject here
  ) {}
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
      await this.villageRepository.create(village);
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

  private async getVillageById(villageId: string): Promise<Village> {
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
