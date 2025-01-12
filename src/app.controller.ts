import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  async createUser(
    @Body() body: { email: string; username: string; password: string },
  ): Promise<string> {
    await this.usersService.create(
      new CreateUserDto(body.username, body.password, body.email),
    );
    return 'User created!';
  }

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
