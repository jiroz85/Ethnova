import { user_role } from '@prisma/client';

export type AuthUser = {
  id: string;
  role: user_role;
  full_name: string;
  email: string | null;
  phone: string | null;
  telegram_username: string | null;
  is_suspended: boolean;
};

export type JwtPayload = {
  sub: string;
};
