export const AdminRole = {
  staff: 'staff',
  admin: 'admin',
} as const;

export type AdminRole = (typeof AdminRole)[keyof typeof AdminRole];

export const ProductStatus = {
  Draft: 'Draft',
  Published: 'Published',
} as const;

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

export const OrderStatus = {
  PendingConfirmation: 'PendingConfirmation',
  Confirmed: 'Confirmed',
  ReadyForDelivery: 'ReadyForDelivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusLabels = {
  PendingConfirmation: 'Pending confirmation',
  Confirmed: 'Confirmed',
  ReadyForDelivery: 'Ready for delivery',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled',
} as const;

export type OrderStatusLabel = (typeof OrderStatusLabels)[OrderStatus];

export const NotificationStatus = {
  Queued: 'Queued',
  Sent: 'Sent',
  Failed: 'Failed',
} as const;

export type NotificationStatus =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

export const NotificationAttemptOutcome = {
  Sent: 'Sent',
  Failed: 'Failed',
} as const;

export type NotificationAttemptOutcome =
  (typeof NotificationAttemptOutcome)[keyof typeof NotificationAttemptOutcome];
