import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  constructor(
    username: string,
    password: string,
    email: string,
    isActive?: boolean,
    refreshToken?: string,
    resetToken?: string,
    raceId?: string,
  ) {
    this.username = username;
    this.password = password;
    this.email = email;
    this.isActive = isActive;
    this.refreshToken = refreshToken;
    this.resetToken = resetToken;
    this.raceId = raceId;
  }

  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'securepassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Indicates if the user is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Refresh token for the user',
    example: 'some-refresh-token',
    required: false,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({
    description: 'Reset token for password recovery',
    example: 'some-reset-token',
    required: false,
  })
  @IsOptional()
  @IsString()
  resetToken?: string;

  @ApiProperty({
    description: 'Race ID of the user (optional)',
    example: '1234abcd',
    required: false,
  })
  @IsOptional()
  @IsString()
  raceId?: string;

  @ApiProperty({
    description: 'List of claimed tiles by the user (optional)',
    type: [String],
    required: false,
  })
  @IsOptional()
  claimedTiles?: string[];
}
