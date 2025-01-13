import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto-request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Request password reset' })
  @ApiBody({ schema: { example: { username: 'user@example.com' } } })
  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { username: string }) {
    return this.authService.requestPasswordReset(body.username);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(loginDto.username, loginDto.password);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({
    schema: { example: { resetToken: 'token', newPassword: 'newPassword' } },
  })
  @Post('reset-password')
  async resetPassword(
    @Body() body: { resetToken: string; newPassword: string },
  ) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { example: { refreshToken: 'refreshToken' } } })
  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshAccessToken(body.refreshToken);
  }
}
