import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import type {
  AddProductImageDto,
  CreateProductDto,
  UpdateProductDto,
} from './products.types';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query('take') take?: string, @Query('category') categorySlug?: string) {
    const parsedTake = take ? Number(take) : undefined;

    return this.productsService.listLatest({
      take: Number.isFinite(parsedTake) ? parsedTake : undefined,
      categorySlug,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine/list')
  listMine(@CurrentUser() user: AuthUser) {
    return this.productsService.listMine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() body: CreateProductDto) {
    return this.productsService.createForSeller(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.productsService.updateForSeller(user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productsService.deleteForSeller(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  addImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: AddProductImageDto,
  ) {
    return this.productsService.addImageForSeller(user.id, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:imageId')
  removeImage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeImageForSeller(user.id, id, imageId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const product = await this.productsService.getById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
