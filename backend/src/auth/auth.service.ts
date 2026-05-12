import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  async register(dto: RegisterDto) {
    const full_name = dto.full_name?.trim();
    const password = dto.password;
    const email = dto.email ? this.normalizeEmail(dto.email) : undefined;
    const phone = dto.phone?.trim();
    const telegram_username = dto.telegram_username?.trim();

    if (!full_name) throw new BadRequestException('full_name is required');
    if (!password || password.length < 6)
      throw new BadRequestException('password must be at least 6 characters');

    if (!email && !phone)
      throw new BadRequestException('email or phone is required');

    const password_hash = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.users.create({
        data: {
          role: 'seller',
          full_name,
          email,
          phone,
          telegram_username,
          password_hash,
        },
        select: {
          id: true,
          role: true,
          full_name: true,
          email: true,
          phone: true,
          telegram_username: true,
          is_suspended: true,
          created_at: true,
        },
      });

      const access_token = await this.jwtService.signAsync({ sub: user.id });

      return {
        access_token,
        user: {
          ...user,
          email: user.email ?? null,
          phone: user.phone ?? null,
          telegram_username: user.telegram_username ?? null,
        },
      };
    } catch (e: any) {
      if (typeof e?.code === 'string' && e.code === 'P2002') {
        throw new ConflictException('Email/phone already in use');
      }
      throw e;
    }
  }

  async login(dto: LoginDto) {
    const emailOrPhone = dto.emailOrPhone?.trim();
    const password = dto.password;

    if (!emailOrPhone)
      throw new BadRequestException('emailOrPhone is required');
    if (!password) throw new BadRequestException('password is required');

    const looksLikeEmail = emailOrPhone.includes('@');

    const user = await this.prisma.users.findFirst({
      where: looksLikeEmail
        ? { email: this.normalizeEmail(emailOrPhone) }
        : { phone: emailOrPhone },
      select: {
        id: true,
        role: true,
        full_name: true,
        email: true,
        phone: true,
        telegram_username: true,
        is_suspended: true,
        password_hash: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.is_suspended) throw new UnauthorizedException('Account suspended');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const access_token = await this.jwtService.signAsync({ sub: user.id });

    return {
      access_token,
      user: {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
        email: user.email ?? null,
        phone: user.phone ?? null,
        telegram_username: user.telegram_username ?? null,
        is_suspended: user.is_suspended,
      },
    };
  }
}
