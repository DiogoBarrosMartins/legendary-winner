import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { HexGridService } from './hex-grid.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('hex-grid')
export class HexGridController {
  constructor(private readonly hexGridService: HexGridService) {}

  @ApiOperation({ summary: 'Generate a grid' })
  @ApiBody({ schema: { example: { name: 'string', size: 'number' } } })
  @ApiResponse({ status: 201, description: 'Grid generated successfully' })
  @Post('generate')
  async generateGrid(@Body() body: { name: string; size: number }) {
    return this.hexGridService.generateGrid(body.name, body.size);
  }

  @ApiOperation({ summary: 'Retrieve all grids' })
  @ApiResponse({ status: 200, description: 'List of grids retrieved successfully' })
  @Get()
  async findAll() {
    return this.hexGridService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a grid by ID' })
  @ApiResponse({ status: 200, description: 'Grid retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Grid not found' })
  @Get(':id')
  async getGridById(@Param('id') id: string) {
    return this.hexGridService.getGridById(id);
  }

  @ApiOperation({ summary: 'Update a grid' })
  @ApiResponse({ status: 200, description: 'Grid updated successfully' })
  @ApiResponse({ status: 404, description: 'Grid not found' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHexGridDto: Record<string, any>,
  ) {
    return this.hexGridService.update(id, updateHexGridDto);
  }

  @ApiOperation({ summary: 'Delete a grid' })
  @ApiResponse({ status: 200, description: 'Grid deleted successfully' })
  @ApiResponse({ status: 404, description: 'Grid not found' })
  @Delete(':id')
  async deleteGrid(@Param('id') id: string) {
    await this.hexGridService.deleteGrid(id);
    return { message: 'Grid deleted successfully.' };
  }

  @ApiOperation({ summary: 'Retrieve tiles of a grid' })
  @ApiResponse({ status: 200, description: 'Tiles retrieved successfully' })
  @Get(':id/tiles')
  async getTiles(
    @Param('id') gridId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.hexGridService.getTiles(gridId, page, limit);
  }

  @ApiOperation({ summary: 'Retrieve adjacent tiles' })
  @ApiResponse({ status: 200, description: 'Adjacent tiles retrieved successfully' })
  @Get(':id/tiles/:q/:r/adjacent')
  async getAdjacentTiles(
    @Param('id') gridId: string,
    @Param('q') q: number,
    @Param('r') r: number,
  ) {
    return this.hexGridService.getAdjacentTilesFromDB(q, r);
  }
}
