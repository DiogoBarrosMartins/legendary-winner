import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FactionService } from './faction.service';
import { Faction } from './entities/faction.entity';
import { HexTileModule } from '../hex-tile/hex-tile.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faction]),
    forwardRef(() => HexTileModule),
  ],
  providers: [FactionService],
  exports: [TypeOrmModule],
})
export class FactionModule {}
