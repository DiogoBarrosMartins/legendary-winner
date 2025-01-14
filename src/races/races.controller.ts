import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { RacesService } from './races.service';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @ApiOperation({ summary: 'Create a new race' })
  @ApiBody({
    schema: {
      example: {
        name: 'Orc',
        traits: { woodBonus: 10, attackBonus: 5 },
        description: 'Strong and aggressive warriors.',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Race created successfully' })
  @Post()
  async createRace(
    @Body()
    body: {
      name: string;
      traits: Record<string, any>;
      description?: string;
    },
  ) {
    return this.racesService.createRace(
      body.name,
      body.traits,
      body.description,
    );
  }

  @ApiOperation({ summary: 'Retrieve all races' })
  @ApiResponse({
    status: 200,
    description: 'List of all races retrieved successfully',
  })
  @Get()
  async findAll() {
    return this.racesService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a race by ID' })
  @ApiResponse({
    status: 200,
    description: 'Race retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Race not found',
  })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
  }
}
