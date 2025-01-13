/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('UsersService');
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // Find user by username
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT tokens
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION || '1h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
    });

    // Save refresh token to the database
    await this.usersService.update(user.id, { refreshToken });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async requestPasswordReset(username: string): Promise<string> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username "${username}" not found`);
    }

    // Generate a reset token
    const resetToken = this.jwtService.sign(
      { username },
      { secret: process.env.JWT_RESET_SECRET, expiresIn: '15m' },
    );

    // Save the reset token in the user entity
    await this.usersService.update(user.id, { resetToken });

    return resetToken; // In production, send the token via email
  }

  async resetPassword(
    resetToken: string,
    newPassword: string,
  ): Promise<string> {
    // Verify the reset token
    let payload: { username: string };
    try {
      payload = this.jwtService.verify(resetToken, {
        secret: process.env.JWT_RESET_SECRET,
      });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Find the user
    const user = await this.usersService.findOneByUsername(payload.username);
    if (!user || user.resetToken !== resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
    });

    return 'Password reset successful';
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    // Verify the refresh token
    let payload: { username: string; sub: number };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Find the user
    const user = await this.usersService.findOne(payload.sub);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate a new access token
    const accessToken = this.jwtService.sign(
      { username: user.username, sub: user.id },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION || '1h',
      },
    );

    return { access_token: accessToken };
  }
}
