import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexTile } from './entities/hex-tile.entity';
import { HexGridService } from './hex-grid.service';
import { HexGridController } from './hex-grid.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HexTile]), // Register HexTile repository
  ],
  controllers: [HexGridController],
  providers: [HexGridService],
  exports: [HexGridService],
})
export class HexGridModule {}
