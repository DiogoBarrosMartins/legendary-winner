import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { HexGridModule } from '../hex-grid/hex-grid.module';
import { RacesModule } from '../races/races.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HexGridModule, RacesModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
