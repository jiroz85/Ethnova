import { SellersService } from './sellers.service';
export declare class SellersController {
    private readonly sellersService;
    constructor(sellersService: SellersService);
    getSeller(id: string): Promise<{
        email: string | null;
        phone: string | null;
        telegram_username: string | null;
        id: string;
        full_name: string;
        created_at: Date;
    }>;
    listSellerProducts(id: string): Promise<{
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
