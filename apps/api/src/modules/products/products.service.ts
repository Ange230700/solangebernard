import {
  type ListPublicProductsQuery,
  type PublicProductDetail,
} from '@repo/contracts';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import type { ListPublicProductsResult } from './products.types';
import {
  DEFAULT_PUBLIC_PRODUCTS_PAGE,
  DEFAULT_PUBLIC_PRODUCTS_PAGE_SIZE,
} from './products.types';

const PRODUCT_NOT_FOUND_CODE = 'ProductNotFound' as const;
const PRODUCT_NOT_FOUND_MESSAGE = 'Product not found.' as const;

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

  async getPublicProduct(productId: string): Promise<PublicProductDetail> {
    const product = await this.productsRepository.getPublicProduct(productId);

    if (!product) {
      throw new NotFoundException({
        code: PRODUCT_NOT_FOUND_CODE,
        message: PRODUCT_NOT_FOUND_MESSAGE,
      });
    }

    return product;
  }
}
