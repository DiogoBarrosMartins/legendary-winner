import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillagesService } from './villages.service';
import { VillagesController } from './villages.controller';
import { Village } from './entities/village.entity';
import { HexTile } from '../hex-grid/entities/hex-tile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Village, HexTile])],
  controllers: [VillagesController],
  providers: [VillagesService],
})
export class VillagesModule {}
