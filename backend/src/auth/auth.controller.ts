import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { Roles } from './roles.decorator';
import { CurrentUser } from './current-user.decorator';
import type { LoginDto, RegisterDto } from './auth.dto';
import type { AuthUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get('admin/users')
  async getAllUsers(
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.authService.getAllUsers({
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get('admin/users/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Patch('admin/users/:id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body() body: { is_suspended: boolean },
  ) {
    return this.authService.suspendUser(id, body.is_suspended);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get('admin/sellers')
  async getSellers(@Query('take') take?: string, @Query('skip') skip?: string) {
    return this.authService.getSellers({
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Roles('admin')
  @Get('admin/stats')
  async getPlatformStats() {
    return this.authService.getPlatformStats();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      full_name?: string;
      email?: string;
      phone?: string;
      telegram_username?: string;
    },
  ) {
    return await this.authService.updateProfile(user.id, body);
  }
}
