import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SellersService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicSellerById(id: string) {
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

  listPublicProductsBySellerId(sellerId: string) {
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
}
