export type RegisterDto = {
    full_name: string;
    email?: string;
    phone?: string;
    telegram_username?: string;
    password: string;
};
export type LoginDto = {
    emailOrPhone: string;
    password: string;
};
