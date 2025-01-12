import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { username: string }) {
    return this.authService.requestPasswordReset(body.username);
  }

  @Post('reset-password')
  async resetPassword(
    @Body() body: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }
  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }
}
