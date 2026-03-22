import type { ListPublicProductsQuery } from '@repo/contracts';
import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import type { ListPublicProductsResult } from './products.types';
import {
  DEFAULT_PUBLIC_PRODUCTS_PAGE,
  DEFAULT_PUBLIC_PRODUCTS_PAGE_SIZE,
} from './products.types';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  listPublicProducts(
    query: ListPublicProductsQuery = {},
  ): Promise<ListPublicProductsResult> {
    return this.productsRepository.listPublicProducts({
      page: query.page ?? DEFAULT_PUBLIC_PRODUCTS_PAGE,
      pageSize: query.pageSize ?? DEFAULT_PUBLIC_PRODUCTS_PAGE_SIZE,
      category: query.category,
    });
  }
}
