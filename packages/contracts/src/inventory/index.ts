import type { ProductStatus } from '../enums.js';
import type { PaginationMeta, PaginationQuery } from '../pagination.js';
import type {
  EntityId,
  IsoDateTimeString,
  ProductSku,
} from '../shared.js';

export interface InventoryVariantSummary {
  id: EntityId;
  productId: EntityId;
  productName: string;
  productStatus: ProductStatus;
  sku: ProductSku;
  size: string | null;
  color: string | null;
  variantLabel: string;
  stock: number;
}

export interface InventoryAdjustment {
  id: EntityId;
  productId: EntityId;
  productVariantId: EntityId;
  actorAdminUserId: EntityId;
  quantityDelta: number;
  reason: string | null;
  recordedAt: IsoDateTimeString;
}

export interface ListInventoryQuery extends PaginationQuery {
  productId?: EntityId;
  productStatus?: ProductStatus;
}

export interface ListInventoryResponse {
  variants: InventoryVariantSummary[];
  pagination: PaginationMeta;
}

export interface InventoryHistoryQuery extends PaginationQuery {
}

export interface AdjustInventoryRequest {
  productId: EntityId;
  productVariantId: EntityId;
  quantityDelta: number;
  reason?: string | null;
}

export interface AdjustInventoryResponse {
  variant: InventoryVariantSummary;
  adjustment: InventoryAdjustment;
}

export interface InventoryHistoryResponse {
  variant: InventoryVariantSummary;
  adjustments: InventoryAdjustment[];
  pagination: PaginationMeta;
}
