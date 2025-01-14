import { PartialType } from '@nestjs/swagger';
import { CreateFactionDto } from './create-faction.dto';

export class UpdateFactionDto extends PartialType(CreateFactionDto) {}
