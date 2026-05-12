import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser, JwtPayload } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.users.findFirst({
      where: { id: payload.sub },
      select: {
        id: true,
        role: true,
        full_name: true,
        email: true,
        phone: true,
        telegram_username: true,
        is_suspended: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid token');
    if (user.is_suspended) throw new UnauthorizedException('Account suspended');

    return {
      ...user,
      email: user.email ?? null,
      phone: user.phone ?? null,
      telegram_username: user.telegram_username ?? null,
    };
  }
}
