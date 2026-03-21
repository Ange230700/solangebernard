import type {
  EntityId,
  IsoDateTimeString,
  OrderReference,
  PhoneNumber,
  PriceAmount,
} from '../shared.js';

export type OrderStatus =
  | 'PendingConfirmation'
  | 'Confirmed'
  | 'ReadyForDelivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderStatusLabel =
  | 'Pending confirmation'
  | 'Confirmed'
  | 'Ready for delivery'
  | 'Delivered'
  | 'Cancelled';

export interface CustomerContact {
  fullName: string;
  phone: PhoneNumber;
  deliveryArea: string;
  deliveryAddress: string;
}

export interface OrderItem {
  id: EntityId;
  productId: EntityId;
  productVariantId: EntityId;
  productNameSnapshot: string;
  variantLabelSnapshot: string;
  unitPriceAmount: PriceAmount;
  quantity: number;
  lineTotalAmount: PriceAmount;
}

export interface CustomerOrder {
  id: EntityId;
  orderReference: OrderReference;
  status: OrderStatus;
  statusLabel: OrderStatusLabel;
  customer: CustomerContact;
  items: OrderItem[];
  totalAmount: PriceAmount;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
}

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

export interface CreateOrderItemRequest {
  productId: EntityId;
  productVariantId: EntityId;
  quantity: number;
}

export interface CreateOrderRequest {
  customer: CustomerContact;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderResponse {
  order: CustomerOrder;
}

export interface LookupOrderQuery {
  reference: OrderReference;
  phone: PhoneNumber;
}

export interface LookupOrderResponse {
  order: CustomerOrder;
}

export interface ListAdminOrdersQuery {
  status?: OrderStatus;
}

export interface ListAdminOrdersResponse {
  orders: AdminOrderSummary[];
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
