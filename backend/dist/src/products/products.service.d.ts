import { PrismaService } from '../prisma/prisma.service';
import type { AddProductImageDto, CreateProductDto, UpdateProductDto } from './products.types';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private buildLocationText;
    listLatest(params: {
        take?: number;
        categorySlug?: string;
    }): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
        seller: {
            id: string;
            phone: string | null;
            full_name: string;
            telegram_username: string | null;
        };
        title: string;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        city: string | null;
        area: string | null;
        location_text: string | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
        }[];
    }[]>;
    getById(id: string): import("@prisma/client").Prisma.Prisma__productsClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        seller: {
            id: string;
            phone: string | null;
            full_name: string;
            telegram_username: string | null;
        };
        title: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        city: string | null;
        area: string | null;
        location_text: string | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            sort_order: number;
            url: string;
        }[];
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listMine(sellerId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        is_published: boolean;
        is_sold: boolean;
        city: string | null;
        area: string | null;
        location_text: string | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
        }[];
    }[]>;
    createForSeller(sellerId: string, dto: CreateProductDto): import("@prisma/client").Prisma.Prisma__productsClient<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        is_published: boolean;
        is_sold: boolean;
        city: string | null;
        area: string | null;
        location_text: string | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
        }[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    updateForSeller(sellerId: string, productId: string, dto: UpdateProductDto): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        title: string;
        description: string;
        price: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        is_published: boolean;
        is_sold: boolean;
        city: string | null;
        area: string | null;
        location_text: string | null;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
        }[];
    }>;
    deleteForSeller(sellerId: string, productId: string): Promise<{
        ok: boolean;
    }>;
    addImageForSeller(sellerId: string, productId: string, dto: AddProductImageDto): Promise<{
        id: string;
        created_at: Date;
        sort_order: number;
        url: string;
    }>;
    removeImageForSeller(sellerId: string, productId: string, imageId: string): Promise<{
        ok: boolean;
    }>;
}
