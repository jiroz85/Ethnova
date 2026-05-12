"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    async register(dto) {
        const full_name = dto.full_name?.trim();
        const password = dto.password;
        const email = dto.email ? this.normalizeEmail(dto.email) : undefined;
        const phone = dto.phone?.trim();
        const telegram_username = dto.telegram_username?.trim();
        if (!full_name)
            throw new common_1.BadRequestException('full_name is required');
        if (!password || password.length < 6)
            throw new common_1.BadRequestException('password must be at least 6 characters');
        if (!email && !phone)
            throw new common_1.BadRequestException('email or phone is required');
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
        }
        catch (e) {
            if (typeof e?.code === 'string' && e.code === 'P2002') {
                throw new common_1.ConflictException('Email/phone already in use');
            }
            throw e;
        }
    }
    async login(dto) {
        const emailOrPhone = dto.emailOrPhone?.trim();
        const password = dto.password;
        if (!emailOrPhone)
            throw new common_1.BadRequestException('emailOrPhone is required');
        if (!password)
            throw new common_1.BadRequestException('password is required');
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
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.is_suspended)
            throw new common_1.UnauthorizedException('Account suspended');
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map