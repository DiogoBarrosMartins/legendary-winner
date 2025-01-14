import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

import { HexTile } from '../hex-tile/entities/hex-tile.entity';
import { Faction } from '../faction/entities/faction.entity';
import { FactionModule } from '../faction/faction.module';
import { HexTileModule } from '../hex-tile/hex-tile.module';
import { Race } from '../races/entities/race.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Race, HexTile, Faction]),
    HexTileModule,
    FactionModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
