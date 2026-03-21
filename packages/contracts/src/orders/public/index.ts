import type { OrderStatus, OrderStatusLabel } from '../../enums.js';
import type {
  EntityId,
  IsoDateTimeString,
  OrderReference,
  PhoneNumber,
  PriceAmount,
} from '../../shared.js';

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
