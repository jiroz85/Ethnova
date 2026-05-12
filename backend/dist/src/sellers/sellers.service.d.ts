import { PrismaService } from '../prisma/prisma.service';
export declare class SellersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPublicSellerById(id: string): import("@prisma/client").Prisma.Prisma__usersClient<{
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
        telegram_username: string | null;
        created_at: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    listPublicProductsBySellerId(sellerId: string): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        created_at: Date;
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
}
