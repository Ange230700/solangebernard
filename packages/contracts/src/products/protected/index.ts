import type { ProductStatus } from '../../enums.js';
import type { PaginationMeta, PaginationQuery } from '../../pagination.js';
import type {
  EntityId,
  IsoDateTimeString,
  PriceAmount,
  ProductSku,
} from '../../shared.js';
import type { ProductMedia, ProductVariant } from '../public/index.js';

export interface AdminProductSummary {
  id: EntityId;
  name: string;
  description: string | null;
  category: string | null;
  priceAmount: PriceAmount | null;
  status: ProductStatus;
  mainMedia: ProductMedia | null;
  variantCount: number;
  mediaCount: number;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface AdminProductDetail {
  id: EntityId;
  name: string;
  description: string | null;
  category: string | null;
  priceAmount: PriceAmount | null;
  status: ProductStatus;
  variants: ProductVariant[];
  media: ProductMedia[];
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface UpsertProductVariantInput {
  id?: EntityId;
  sku: ProductSku;
  size?: string | null;
  color?: string | null;
  variantLabel: string;
  stock: number;
}

export interface ListAdminProductsQuery extends PaginationQuery {
  category?: string;
  status?: ProductStatus;
}

export interface ListAdminProductsResponse {
  products: AdminProductSummary[];
  pagination: PaginationMeta;
}

export interface GetAdminProductResponse {
  product: AdminProductDetail;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  category?: string | null;
  priceAmount?: PriceAmount | null;
}

export interface CreateProductResponse {
  product: AdminProductDetail;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string | null;
  category?: string | null;
  priceAmount?: PriceAmount | null;
  variants?: UpsertProductVariantInput[];
}

export interface UpdateProductResponse {
  product: AdminProductDetail;
}

export interface PublishProductResponse {
  product: AdminProductDetail;
}

export interface UnpublishProductResponse {
  product: AdminProductDetail;
}
