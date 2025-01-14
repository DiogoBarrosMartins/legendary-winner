import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { HexTileService } from './hex-tile.service';
import { HexTile, TileState } from './entities/hex-tile.entity';

@ApiTags('Hex Tiles')
@Controller('hex-tiles')
export class HexTileController {
  constructor(private readonly hexTileService: HexTileService) {}

  @ApiOperation({ summary: 'Create a new hex tile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        q: { type: 'number' },
        r: { type: 'number' },
        factionId: { type: 'string', nullable: true },
        tileState: { enum: ['neutral', 'occupied', 'contested'] },
      },
    },
  })
  @Post()
  async createHexTile(
    @Body()
    body: {
      q: number;
      r: number;
      factionId?: string;
      tileState?: TileState;
    },
  ) {
    return this.hexTileService.createHexTile(
      body.q,
      body.r,
      body.factionId,
      body.tileState,
    );
  }

  @ApiOperation({ summary: 'Get a specific hex tile by coordinates' })
  @ApiQuery({ name: 'q', type: 'number', required: true })
  @ApiQuery({ name: 'r', type: 'number', required: true })
  @Get()
  async getTile(@Query('q') q: number, @Query('r') r: number) {
    return this.hexTileService.getTile(q, r);
  }

  @ApiOperation({ summary: 'Get all tiles within a range of a coordinate' })
  @ApiQuery({ name: 'q', type: 'number', required: true })
  @ApiQuery({ name: 'r', type: 'number', required: true })
  @ApiQuery({ name: 'range', type: 'number', required: true })
  @Get('range')
  async getTilesInRange(
    @Query('q') q: number,
    @Query('r') r: number,
    @Query('range') range: number,
  ) {
    return this.hexTileService.getTilesInRange(q, r, range);
  }

  @ApiOperation({ summary: 'Assign an owner to a hex tile' })
  @ApiParam({ name: 'q', type: 'number', required: true })
  @ApiParam({ name: 'r', type: 'number', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ownerId: { type: 'string' },
      },
    },
  })
  @Patch(':q/:r/owner')
  async assignOwner(
    @Param('q') q: number,
    @Param('r') r: number,
    @Body('ownerId') ownerId: string,
  ) {
    return this.hexTileService.assignOwner(q, r, ownerId);
  }

  @ApiOperation({ summary: 'Update tile yields for a hex tile' })
  @ApiParam({ name: 'q', type: 'number', required: true })
  @ApiParam({ name: 'r', type: 'number', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @Patch(':q/:r/yields')
  async updateTileYields(
    @Param('q') q: number,
    @Param('r') r: number,
    @Body() yields: Partial<HexTile>,
  ) {
    return this.hexTileService.updateTileYields(q, r, yields);
  }

  @ApiOperation({ summary: 'Generate the entire map' })
  @Post('generate-map')
  async generateMap() {
    return this.hexTileService.generateMap();
  }
}
