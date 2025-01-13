import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { Resources } from './entities/resource.entity';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourceService: ResourcesService) {}

  @Get(':villageId')
  async getResources(@Param('villageId') villageId: string): Promise<Resources> {
    return this.resourceService.getAvailableResources(villageId);
  }

  @Patch(':villageId/update')
  async updateResources(@Param('villageId') villageId: string): Promise<void> {
    await this.resourceService.updateVillageResources(villageId);
  }

  @Patch(':villageId/deduct')
  async deductResources(
    @Param('villageId') villageId: string,
    @Body() resourcesToDeduct: Partial<Resources>,
  ): Promise<void> {
    await this.resourceService.deductResources(villageId, resourcesToDeduct);
  }
}
