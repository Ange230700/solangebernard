import type { PaginationMeta, PublicProductSummary } from '@repo/contracts';

export const DEFAULT_PUBLIC_PRODUCTS_PAGE = 1;
export const DEFAULT_PUBLIC_PRODUCTS_PAGE_SIZE = 20;
export const MAX_PUBLIC_PRODUCTS_PAGE_SIZE = 100;

export interface ListPublicProductsParams {
  page: number;
  pageSize: number;
  category?: string | undefined;
}

export interface ListPublicProductsResult {
  products: PublicProductSummary[];
  pagination: PaginationMeta;
}
