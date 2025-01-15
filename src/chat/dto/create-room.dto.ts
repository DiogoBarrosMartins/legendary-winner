import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The name of the room',
    example: 'General Room',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The unique identifier for the room',
    example: 'general-room',
  })
  @IsString()
  @IsOptional() // Optional because it might be generated server-side
  identifier?: string;

  @ApiProperty({
    description: 'Allowed player IDs for this room (JSON array)',
    example: ['player1', 'player2'],
  })
  @IsOptional()
  allowedPlayerIds?: string[];
}
