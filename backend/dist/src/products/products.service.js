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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    buildLocationText(params) {
        const city = params.city?.trim() ? params.city.trim() : null;
        const area = params.area?.trim() ? params.area.trim() : null;
        const locationText = params.location_text?.trim()
            ? params.location_text.trim()
            : null;
        if (locationText)
            return locationText;
        if (city && area)
            return `${city} - ${area}`;
        if (city)
            return city;
        if (area)
            return area;
        return null;
    }
    listLatest(params) {
        const take = params.take ?? 24;
        return this.prisma.products.findMany({
            take,
            where: {
                is_published: true,
                is_sold: false,
                ...(params.categorySlug
                    ? { category: { slug: params.categorySlug } }
                    : {}),
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
                seller: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        telegram_username: true,
                    },
                },
            },
        });
    }
    getById(id) {
        return this.prisma.products.findFirst({
            where: {
                id,
                is_published: true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                currency: true,
                city: true,
                area: true,
                location_text: true,
                created_at: true,
                updated_at: true,
                images: {
                    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
                    select: { id: true, url: true, sort_order: true },
                },
                category: {
                    select: { id: true, name: true, slug: true },
                },
                seller: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                        telegram_username: true,
                    },
                },
            },
        });
    }
    listMine(sellerId) {
        return this.prisma.products.findMany({
            where: {
                seller_id: sellerId,
            },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                currency: true,
                city: true,
                area: true,
                location_text: true,
                is_published: true,
                is_sold: true,
                created_at: true,
                updated_at: true,
                images: {
                    take: 1,
                    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
                    select: { id: true, url: true },
                },
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    createForSeller(sellerId, dto) {
        if (!dto.title?.trim())
            throw new common_1.ForbiddenException('title is required');
        if (!dto.description?.trim())
            throw new common_1.ForbiddenException('description is required');
        if (!dto.category_id)
            throw new common_1.ForbiddenException('category_id is required');
        if (dto.price === undefined || dto.price === null)
            throw new common_1.ForbiddenException('price is required');
        const city = dto.city?.trim() ? dto.city.trim() : undefined;
        const area = dto.area?.trim() ? dto.area.trim() : undefined;
        const location_text = this.buildLocationText({
            city,
            area,
            location_text: dto.location_text,
        });
        return this.prisma.products.create({
            data: {
                seller_id: sellerId,
                category_id: dto.category_id,
                title: dto.title.trim(),
                description: dto.description.trim(),
                price: dto.price,
                currency: dto.currency ?? 'USD',
                city,
                area,
                location_text,
                is_published: dto.is_published ?? true,
            },
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                currency: true,
                city: true,
                area: true,
                location_text: true,
                is_published: true,
                is_sold: true,
                created_at: true,
                updated_at: true,
                images: {
                    take: 1,
                    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
                    select: { id: true, url: true },
                },
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async updateForSeller(sellerId, productId, dto) {
        const existing = await this.prisma.products.findFirst({
            where: { id: productId },
            select: { id: true, seller_id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        if (existing.seller_id !== sellerId)
            throw new common_1.ForbiddenException('Not your product');
        const data = {};
        if (dto.category_id !== undefined)
            data.category_id = dto.category_id;
        if (dto.title !== undefined)
            data.title = dto.title.trim();
        if (dto.description !== undefined)
            data.description = dto.description.trim();
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.currency !== undefined)
            data.currency = dto.currency;
        if (dto.city !== undefined)
            data.city = dto.city?.trim() ? dto.city.trim() : null;
        if (dto.area !== undefined)
            data.area = dto.area?.trim() ? dto.area.trim() : null;
        if (dto.location_text !== undefined)
            data.location_text = dto.location_text?.trim()
                ? dto.location_text.trim()
                : null;
        if (dto.city !== undefined ||
            dto.area !== undefined ||
            dto.location_text !== undefined) {
            const city = data.city ?? undefined;
            const area = data.area ?? undefined;
            const location_text = data.location_text ?? undefined;
            data.location_text = this.buildLocationText({
                city,
                area,
                location_text,
            });
        }
        if (dto.is_published !== undefined)
            data.is_published = dto.is_published;
        if (dto.is_sold !== undefined)
            data.is_sold = dto.is_sold;
        return this.prisma.products.update({
            where: { id: productId },
            data,
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                currency: true,
                city: true,
                area: true,
                location_text: true,
                is_published: true,
                is_sold: true,
                created_at: true,
                updated_at: true,
                images: {
                    take: 1,
                    orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
                    select: { id: true, url: true },
                },
                category: { select: { id: true, name: true, slug: true } },
            },
        });
    }
    async deleteForSeller(sellerId, productId) {
        const existing = await this.prisma.products.findFirst({
            where: { id: productId },
            select: { id: true, seller_id: true },
        });
        if (!existing)
            throw new common_1.NotFoundException('Product not found');
        if (existing.seller_id !== sellerId)
            throw new common_1.ForbiddenException('Not your product');
        await this.prisma.products.delete({
            where: { id: productId },
            select: { id: true },
        });
        return { ok: true };
    }
    async addImageForSeller(sellerId, productId, dto) {
        const url = dto.url?.trim();
        if (!url)
            throw new common_1.ForbiddenException('url is required');
        const product = await this.prisma.products.findFirst({
            where: { id: productId },
            select: { id: true, seller_id: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.seller_id !== sellerId)
            throw new common_1.ForbiddenException('Not your product');
        const image = await this.prisma.product_images.create({
            data: {
                product_id: productId,
                url,
                sort_order: dto.sort_order ?? 0,
            },
            select: { id: true, url: true, sort_order: true, created_at: true },
        });
        return image;
    }
    async removeImageForSeller(sellerId, productId, imageId) {
        const product = await this.prisma.products.findFirst({
            where: { id: productId },
            select: { id: true, seller_id: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.seller_id !== sellerId)
            throw new common_1.ForbiddenException('Not your product');
        const image = await this.prisma.product_images.findFirst({
            where: { id: imageId, product_id: productId },
            select: { id: true },
        });
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        await this.prisma.product_images.delete({
            where: { id: imageId },
            select: { id: true },
        });
        return { ok: true };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map