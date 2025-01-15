import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({
    description: 'The updated name of the room',
    example: 'Updated Room',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Updated list of allowed player IDs (JSON array)',
    example: ['player1', 'player3'],
    required: false,
  })
  @IsOptional()
  allowedPlayerIds?: string[];
}
