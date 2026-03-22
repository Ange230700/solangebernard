import { Controller, Get, Param, Query } from '@nestjs/common';
import type {
  GetPublicProductResponse,
  ListPublicProductsResponse,
} from '@repo/contracts';
import { ListPublicProductsQueryDto } from './list-public-products.query';
import {
  mapGetPublicProductResponse,
  mapListPublicProductsResponse,
} from './products.response';
import { ProductsService } from './products.service';

@Controller('catalog/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async listPublicProducts(
    @Query() query: ListPublicProductsQueryDto,
  ): Promise<ListPublicProductsResponse> {
    const result = await this.productsService.listPublicProducts(query);

    return mapListPublicProductsResponse(result);
  }

  @Get(':productId')
  async getPublicProduct(
    @Param('productId') productId: string,
  ): Promise<GetPublicProductResponse> {
    const product = await this.productsService.getPublicProduct(productId);

    return mapGetPublicProductResponse(product);
  }
}
