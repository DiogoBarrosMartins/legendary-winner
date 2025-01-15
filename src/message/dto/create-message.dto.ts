import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID of the sender',
    example: 'user123',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'ID of the receiver (optional for public messages)',
    example: 'user456',
  })
  @IsString()
  @IsOptional()
  receiverId?: string;

  @ApiProperty({
    description: 'ID of the room where the message is sent',
    example: 'general-room',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, world!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
