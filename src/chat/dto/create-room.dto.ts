import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  allowedUsers?: string[];
}
