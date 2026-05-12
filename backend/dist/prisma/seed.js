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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const seller = await prisma.users.upsert({
        where: { email: 'seller@example.com' },
        update: {
            full_name: 'Example Seller',
            phone: '+0000000000',
            telegram_username: 'example_seller',
            is_suspended: false,
        },
        create: {
            role: 'seller',
            full_name: 'Example Seller',
            email: 'seller@example.com',
            phone: '+0000000000',
            telegram_username: 'example_seller',
            password_hash: await bcrypt.hash('password123', 10),
            is_suspended: false,
        },
        select: { id: true },
    });
    const categories = await prisma.categories.findMany({
        where: { is_active: true },
        select: { id: true, slug: true, name: true },
    });
    const examplesBySlug = {
        shoes: [
            {
                title: 'Nike Air Sneakers',
                description: 'Clean sneakers in good condition. Size 42.',
                price: 65,
                location: 'City Center',
            },
            {
                title: 'Leather Boots',
                description: 'Durable boots, lightly used.',
                price: 80,
                location: 'Downtown',
            },
        ],
        clothes: [
            {
                title: 'Denim Jacket',
                description: 'Classic denim jacket, medium size.',
                price: 25,
                location: 'West Side',
            },
            {
                title: 'Hoodie (New)',
                description: 'Brand new hoodie, never worn.',
                price: 18,
                location: 'City Center',
            },
        ],
        phones: [
            {
                title: 'iPhone 12 128GB',
                description: 'Good condition, battery 86%.',
                price: 320,
                location: 'East Side',
            },
            {
                title: 'Samsung Galaxy A54',
                description: 'Almost new, with box.',
                price: 210,
                location: 'Downtown',
            },
        ],
        accessories: [
            {
                title: 'AirPods Pro (2nd Gen)',
                description: 'Great sound, includes case.',
                price: 120,
                location: 'City Center',
            },
            {
                title: 'Smart Watch',
                description: 'Fitness tracking + notifications.',
                price: 45,
                location: 'West Side',
            },
        ],
    };
    for (const cat of categories) {
        const examples = examplesBySlug[cat.slug] ?? [];
        for (const ex of examples) {
            const existing = await prisma.products.findFirst({
                where: {
                    seller_id: seller.id,
                    category_id: cat.id,
                    title: ex.title,
                },
                select: { id: true },
            });
            if (existing)
                continue;
            await prisma.products.create({
                data: {
                    seller_id: seller.id,
                    category_id: cat.id,
                    title: ex.title,
                    description: ex.description,
                    price: ex.price,
                    currency: 'USD',
                    is_published: true,
                    is_sold: false,
                    location_text: ex.location,
                },
            });
        }
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    await prisma.$disconnect();
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map