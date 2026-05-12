import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AddProductImageDto,
  CreateProductDto,
  UpdateProductDto,
} from './products.types';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildLocationText(params: {
    city?: string | null;
    area?: string | null;
    location_text?: string | null;
  }) {
    const city = params.city?.trim() ? params.city.trim() : null;
    const area = params.area?.trim() ? params.area.trim() : null;
    const locationText = params.location_text?.trim()
      ? params.location_text.trim()
      : null;

    if (locationText) return locationText;
    if (city && area) return `${city} - ${area}`;
    if (city) return city;
    if (area) return area;
    return null;
  }

  listLatest(params: { take?: number; categorySlug?: string }) {
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

  getById(id: string) {
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

  listMine(sellerId: string) {
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

  createForSeller(sellerId: string, dto: CreateProductDto) {
    if (!dto.title?.trim()) throw new ForbiddenException('title is required');
    if (!dto.description?.trim())
      throw new ForbiddenException('description is required');
    if (!dto.category_id)
      throw new ForbiddenException('category_id is required');
    if (dto.price === undefined || dto.price === null)
      throw new ForbiddenException('price is required');

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

  async updateForSeller(
    sellerId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const existing = await this.prisma.products.findFirst({
      where: { id: productId },
      select: { id: true, seller_id: true },
    });

    if (!existing) throw new NotFoundException('Product not found');
    if (existing.seller_id !== sellerId)
      throw new ForbiddenException('Not your product');

    const data: Record<string, unknown> = {};
    if (dto.category_id !== undefined) data.category_id = dto.category_id;
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.currency !== undefined) data.currency = dto.currency;

    if (dto.city !== undefined)
      data.city = dto.city?.trim() ? dto.city.trim() : null;
    if (dto.area !== undefined)
      data.area = dto.area?.trim() ? dto.area.trim() : null;
    if (dto.location_text !== undefined)
      data.location_text = dto.location_text?.trim()
        ? dto.location_text.trim()
        : null;

    if (
      dto.city !== undefined ||
      dto.area !== undefined ||
      dto.location_text !== undefined
    ) {
      const city = (data.city as string | null | undefined) ?? undefined;
      const area = (data.area as string | null | undefined) ?? undefined;
      const location_text =
        (data.location_text as string | null | undefined) ?? undefined;
      data.location_text = this.buildLocationText({
        city,
        area,
        location_text,
      });
    }

    if (dto.is_published !== undefined) data.is_published = dto.is_published;
    if (dto.is_sold !== undefined) data.is_sold = dto.is_sold;

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

  async deleteForSeller(sellerId: string, productId: string) {
    const existing = await this.prisma.products.findFirst({
      where: { id: productId },
      select: { id: true, seller_id: true },
    });

    if (!existing) throw new NotFoundException('Product not found');
    if (existing.seller_id !== sellerId)
      throw new ForbiddenException('Not your product');

    await this.prisma.products.delete({
      where: { id: productId },
      select: { id: true },
    });

    return { ok: true };
  }

  async addImageForSeller(
    sellerId: string,
    productId: string,
    dto: AddProductImageDto,
  ) {
    const url = dto.url?.trim();
    if (!url) throw new ForbiddenException('url is required');

    const product = await this.prisma.products.findFirst({
      where: { id: productId },
      select: { id: true, seller_id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller_id !== sellerId)
      throw new ForbiddenException('Not your product');

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

  async removeImageForSeller(
    sellerId: string,
    productId: string,
    imageId: string,
  ) {
    const product = await this.prisma.products.findFirst({
      where: { id: productId },
      select: { id: true, seller_id: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.seller_id !== sellerId)
      throw new ForbiddenException('Not your product');

    const image = await this.prisma.product_images.findFirst({
      where: { id: imageId, product_id: productId },
      select: { id: true },
    });
    if (!image) throw new NotFoundException('Image not found');

    await this.prisma.product_images.delete({
      where: { id: imageId },
      select: { id: true },
    });

    return { ok: true };
  }
}
