import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { VillagesService } from './villages.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('villages')
export class VillagesController {
  constructor(private readonly villagesService: VillagesService) {}

  @ApiOperation({ summary: 'Create a new village' })
  @ApiBody({
    schema: {
      example: {
        tileId: 'a3f0bdea-8e94-4b2e-8c26-d2bcf69fdd18',
        name: 'Stronghold',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Village created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @Post()
  async createVillage(@Body() body: { tileId: string; name: string }) {
    return this.villagesService.createVillage(body.tileId, body.name);
  }

  @ApiOperation({ summary: 'Retrieve a village by ID' })
  @ApiResponse({ status: 200, description: 'Village retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Village not found' })
  @Get(':id')
  async getVillage(@Param('id') id: string) {
    return this.villagesService.getVillageById(id);
  }

  @ApiOperation({ summary: 'Upgrade a building in a village' })
  @ApiBody({
    schema: {
      example: {
        buildingType: 'farm',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Building upgraded successfully' })
  @ApiResponse({ status: 404, description: 'Village or building not found' })
  @Patch(':id/upgrade')
  async upgradeBuilding(
    @Param('id') villageId: string,
    @Body() body: { buildingType: string },
  ) {
    return this.villagesService.upgradeBuilding(villageId, body.buildingType);
  }

  @ApiOperation({ summary: 'Collect resources from a village' })
  @ApiResponse({
    status: 200,
    description: 'Resources collected successfully',
  })
  @ApiResponse({ status: 404, description: 'Village not found' })
  @Patch(':id/collect')
  async collectResources(@Param('id') villageId: string) {
    return this.villagesService.collectResources(villageId);
  }
}
