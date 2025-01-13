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
import { CreateHexGridDto } from './dto/create-hex-grid.dto';
import { UpdateHexGridDto } from './dto/update-hex-grid.dto';

@Controller('hex-grid')
export class HexGridController {
  constructor(private readonly hexGridService: HexGridService) {}
  @Post('generate')
  async generateGrid(@Body() body: { name: string; size: number }) {
    return this.hexGridService.generateGrid(body.name, body.size);
  }
  @Post()
  create(@Body() createHexGridDto: CreateHexGridDto) {
    return this.hexGridService.create(createHexGridDto);
  }

  @Get()
  findAll() {
    return this.hexGridService.findAll();
  }

  @Get(':id')
  async getGridById(@Param('id') id: string) {
    return this.hexGridService.getGridById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHexGridDto: UpdateHexGridDto) {
    return this.hexGridService.update(+id, updateHexGridDto);
  }

  @Delete(':id')
  async deleteGrid(@Param('id') id: string) {
    await this.hexGridService.deleteGrid(id);
    return { message: 'Grid deleted successfully.' };
  }
  @Get(':id/tiles')
  async getTiles(
    @Param('id') gridId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.hexGridService.getTiles(gridId, page, limit);
  }
}
