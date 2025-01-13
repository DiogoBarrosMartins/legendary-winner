import { PartialType } from '@nestjs/swagger';
import { CreateHexGridDto } from './create-hex-grid.dto';

export class UpdateHexGridDto extends PartialType(CreateHexGridDto) {}
