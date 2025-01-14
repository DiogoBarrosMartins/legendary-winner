import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HexTileService } from './hex-tile.service';
import { HexTileController } from './hex-tile.controller';
import { HexTile } from './entities/hex-tile.entity';
import { FactionModule } from '../faction/faction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HexTile]),
    forwardRef(() => FactionModule),
  ],
  controllers: [HexTileController],
  providers: [HexTileService],
  exports: [HexTileService], // Export services and TypeOrm for other modules
})
export class HexTileModule {}
