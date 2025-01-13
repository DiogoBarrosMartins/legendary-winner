import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RacesService } from './races.service';
import { RacesController } from './races.controller';
import { Race } from './entities/race.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Race])],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [TypeOrmModule], // Export TypeOrmModule so other modules can access RaceRepository
})
export class RacesModule {}
