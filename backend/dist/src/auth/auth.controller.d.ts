import { AuthService } from './auth.service';
import type { LoginDto, RegisterDto } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        access_token: string;
        user: {
            email: string | null;
            phone: string | null;
            telegram_username: string | null;
            id: string;
            role: import("@prisma/client").$Enums.user_role;
            full_name: string;
            is_suspended: boolean;
            created_at: Date;
        };
    }>;
    login(body: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            role: import("@prisma/client").$Enums.user_role;
            full_name: string;
            email: string | null;
            phone: string | null;
            telegram_username: string | null;
            is_suspended: false;
        };
    }>;
}
