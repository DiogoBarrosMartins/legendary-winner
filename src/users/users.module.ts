import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HexGridModule } from '../hex-grid/hex-grid.module';
import { RacesModule } from '../races/races.module';
import { HexTile } from '../hex-grid/entities/hex-tile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HexTile, User]), HexGridModule, RacesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
