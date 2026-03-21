import type { OrderStatus, OrderStatusLabel } from '../../enums.js';
import type { PaginationMeta, PaginationQuery } from '../../pagination.js';
import type {
  EntityId,
  IsoDateTimeString,
  OrderReference,
  PriceAmount,
} from '../../shared.js';
import type { CustomerContact, OrderItem } from '../public/index.js';

export interface AdminOrderSummary {
  id: EntityId;
  orderReference: OrderReference;
  status: OrderStatus;
  statusLabel: OrderStatusLabel;
  customer: CustomerContact;
  itemCount: number;
  totalAmount: PriceAmount;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: OrderItem[];
  internalNotes: string | null;
}

export interface ListAdminOrdersQuery extends PaginationQuery {
  status?: OrderStatus;
}

export interface ListAdminOrdersResponse {
  orders: AdminOrderSummary[];
  pagination: PaginationMeta;
}

export interface GetAdminOrderResponse {
  order: AdminOrderDetail;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  order: AdminOrderDetail;
}

export interface AddOrderNoteRequest {
  note: string;
}

export interface AddOrderNoteResponse {
  order: AdminOrderDetail;
}
