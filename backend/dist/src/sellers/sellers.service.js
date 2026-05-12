"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SellersService = class SellersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPublicSellerById(id) {
        return this.prisma.users.findFirst({
            where: {
                id,
                role: 'seller',
                is_suspended: false,
            },
            select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                telegram_username: true,
                created_at: true,
            },
        });
    }
    listPublicProductsBySellerId(sellerId) {
        return this.prisma.products.findMany({
            where: {
                seller_id: sellerId,
                is_published: true,
                is_sold: false,
                seller: {
                    is_suspended: false,
                    role: 'seller',
                },
            },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                title: true,
                price: true,
                currency: true,
                city: true,
                area: true,
                location_text: true,
                created_at: true,
                images: {
                    take: 1,
                    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
                    select: { id: true, url: true },
                },
                category: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    }
};
exports.SellersService = SellersService;
exports.SellersService = SellersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SellersService);
//# sourceMappingURL=sellers.service.js.map