import { PartialType } from '@nestjs/swagger';
import { CreateVillageDto } from './create-village.dto';

export class UpdateVillageDto extends PartialType(CreateVillageDto) {}
