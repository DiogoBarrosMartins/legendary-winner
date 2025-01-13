import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { Resources } from './entities/resource.entity';
import { VillagesModule } from '../villages/villages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resources]), // Import only Resources entity here
    forwardRef(() => VillagesModule), // Import VillagesModule to access VillageRepository
  ],
  controllers: [ResourcesController], // Declare controller
  providers: [ResourcesService], // Provide service
  exports: [ResourcesService], // Export service if needed
})
export class ResourcesModule {}
