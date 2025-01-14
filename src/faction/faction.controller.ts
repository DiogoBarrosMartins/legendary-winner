import { Controller, Post, Get, Patch, Param, Body } from '@nestjs/common';
import { FactionService } from './faction.service';

@Controller('factions')
export class FactionController {
  constructor(private readonly factionService: FactionService) {}

  @Post()
  async createFaction(@Body() body: { name: string; description: string }) {
    return this.factionService.createFaction(body.name, body.description);
  }

  @Get(':id')
  async getFactionById(@Param('id') id: string) {
    return this.factionService.getFactionById(id);
  }

  @Patch(':id/city')
  async addCity(
    @Param('id') factionId: string,
    @Body() body: { cityName: string; q: number; r: number },
  ) {
    return this.factionService.addCity(
      factionId,
      body.cityName,
      body.q,
      body.r,
    );
  }

  @Patch(':id/outpost')
  async addOutpost(
    @Param('id') factionId: string,
    @Body() body: { outpostName: string; q: number; r: number },
  ) {
    return this.factionService.addOutpost(
      factionId,
      body.outpostName,
      body.q,
      body.r,
    );
  }

  @Patch(':id/influence')
  async updateInfluencePoints(
    @Param('id') factionId: string,
    @Body() body: { points: number },
  ) {
    return this.factionService.updateInfluencePoints(factionId, body.points);
  }

  @Get(':id/territory')
  async getFactionTerritory(@Param('id') factionId: string) {
    return this.factionService.getFactionTerritory(factionId);
  }
}
