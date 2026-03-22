import { Controller, Get, Query } from '@nestjs/common';
import type { ListPublicProductsResponse } from '@repo/contracts';
import { ListPublicProductsQueryDto } from './list-public-products.query';
import { mapListPublicProductsResponse } from './products.response';
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
}
