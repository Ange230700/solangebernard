import type { OrderStatus } from '../orders/index.js';
import type {
  EntityId,
  IsoDateTimeString,
  PhoneNumber,
} from '../shared.js';

export type NotificationStatus = 'Queued' | 'Sent' | 'Failed';

export type NotificationAttemptOutcome = 'Sent' | 'Failed';

export interface NotificationAttempt {
  id: EntityId;
  notificationId: EntityId;
  outcome: NotificationAttemptOutcome;
  providerReference: string | null;
  providerResponseCode: string | null;
  providerMessage: string | null;
  attemptedAt: IsoDateTimeString;
}

export interface NotificationSummary {
  id: EntityId;
  orderId: EntityId;
  relatedOrderStatus: OrderStatus | null;
  triggerEvent: string;
  status: NotificationStatus;
  channel: string | null;
  recipientName: string;
  recipientPhone: PhoneNumber;
  triggeredByAdminUserId: EntityId | null;
  queuedAt: IsoDateTimeString;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
  attemptCount: number;
  lastAttempt: NotificationAttempt | null;
}

export interface NotificationDetail extends NotificationSummary {
  attempts: NotificationAttempt[];
}

export interface ListNotificationsQuery {
  orderId?: EntityId;
  status?: NotificationStatus;
}

export interface ListNotificationsResponse {
  notifications: NotificationSummary[];
}

export interface GetNotificationResponse {
  notification: NotificationDetail;
}

export type RetryNotificationRequest = Record<string, never>;

export interface RetryNotificationResponse {
  notification: NotificationDetail;
}
