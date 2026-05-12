import { ProductsService } from './products.service';
import type { AuthUser } from '../auth/auth.types';
import type { AddProductImageDto, CreateProductDto, UpdateProductDto } from './products.types';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    list(take?: string, categorySlug?: string): import("@prisma/client").Prisma.PrismaPromise<{
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
    listMine(user: AuthUser): import("@prisma/client").Prisma.PrismaPromise<{
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
    create(user: AuthUser, body: CreateProductDto): import("@prisma/client").Prisma.Prisma__productsClient<{
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
    update(user: AuthUser, id: string, body: UpdateProductDto): Promise<{
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
    remove(user: AuthUser, id: string): Promise<{
        ok: boolean;
    }>;
    addImage(user: AuthUser, id: string, body: AddProductImageDto): Promise<{
        id: string;
        created_at: Date;
        sort_order: number;
        url: string;
    }>;
    removeImage(user: AuthUser, id: string, imageId: string): Promise<{
        ok: boolean;
    }>;
    get(id: string): Promise<{
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
    }>;
}
