import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexTile } from './entities/hex-tile.entity';
import { HexGridService } from './hex-grid.service';
import { HexGridController } from './hex-grid.controller';
import { HexGrid } from './entities/hex-grid.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HexTile, HexGrid]),
  ],
  controllers: [HexGridController],
  providers: [HexGridService],
  exports: [HexGridService],
})
export class HexGridModule {}
