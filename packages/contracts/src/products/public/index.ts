import type { PaginationMeta, PaginationQuery } from '../../pagination.js';
import type { EntityId, PriceAmount, ProductSku } from '../../shared.js';

export interface ProductMedia {
  id: EntityId;
  url: string;
  altText: string | null;
  isMain: boolean;
  displayOrder: number | null;
}

export interface ProductVariant {
  id: EntityId;
  sku: ProductSku;
  size: string | null;
  color: string | null;
  variantLabel: string;
  stock: number;
  inStock: boolean;
}

export interface PublicProductSummary {
  id: EntityId;
  name: string;
  description: string | null;
  category: string | null;
  priceAmount: PriceAmount;
  mainMedia: ProductMedia;
}

export interface PublicProductDetail extends PublicProductSummary {
  media: ProductMedia[];
  variants: ProductVariant[];
}

export interface ListPublicProductsQuery extends PaginationQuery {
  category?: string;
}

export interface ListPublicProductsResponse {
  products: PublicProductSummary[];
  pagination: PaginationMeta;
}

export interface GetPublicProductResponse {
  product: PublicProductDetail;
}
