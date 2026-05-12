import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Get(':id')
  async getSeller(@Param('id') id: string) {
    const seller = await this.sellersService.getPublicSellerById(id);
    if (!seller) throw new NotFoundException('Seller not found');
    return {
      ...seller,
      email: seller.email ?? null,
      phone: seller.phone ?? null,
      telegram_username: seller.telegram_username ?? null,
    };
  }

  @Get(':id/products')
  async listSellerProducts(@Param('id') id: string) {
    const seller = await this.sellersService.getPublicSellerById(id);
    if (!seller) throw new NotFoundException('Seller not found');
    return this.sellersService.listPublicProductsBySellerId(id);
  }
}
