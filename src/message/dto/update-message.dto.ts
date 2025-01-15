import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Updated content of the message',
    example: 'Updated message content',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
