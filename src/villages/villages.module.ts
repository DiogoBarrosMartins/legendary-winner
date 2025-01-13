import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VillagesService } from './villages.service';
import { VillagesController } from './villages.controller';
import { Village } from './entities/village.entity';
import { HexTile } from '../hex-grid/entities/hex-tile.entity';
import { Resources } from '../resources/entities/resource.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Village, HexTile, Resources]), // Import TypeORM entities
  ],
  controllers: [VillagesController], // Declare controller
  providers: [VillagesService], // Provide service
  exports: [VillagesService, TypeOrmModule], // Export VillagesService and TypeOrmModule
})
export class VillagesModule {}
