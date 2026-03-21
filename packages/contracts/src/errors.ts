export const DomainErrorCode = {
  ValidationFailed: 'ValidationFailed',
  InvalidCredentials: 'InvalidCredentials',
  AccountDisabled: 'AccountDisabled',
  Unauthorized: 'Unauthorized',
  Forbidden: 'Forbidden',
  ProductNotFound: 'ProductNotFound',
  VariantNotFound: 'VariantNotFound',
  OrderNotFound: 'OrderNotFound',
  OrderLookupFailed: 'OrderLookupFailed',
  InsufficientStock: 'InsufficientStock',
  InvalidStatusTransition: 'InvalidStatusTransition',
  IncompleteProductCannotPublish: 'IncompleteProductCannotPublish',
  InvalidOrExpiredPasswordResetToken: 'InvalidOrExpiredPasswordResetToken',
  WeakPassword: 'WeakPassword',
  NotificationDeliveryFailed: 'NotificationDeliveryFailed',
} as const;

export type DomainErrorCode =
  (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

export const TransportErrorCode = {
  InternalServerError: 'InternalServerError',
} as const;

export type TransportErrorCode =
  (typeof TransportErrorCode)[keyof typeof TransportErrorCode];

export type ErrorCode = DomainErrorCode | TransportErrorCode;

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ErrorBody<TCode extends string = ErrorCode> {
  code: TCode;
  message: string;
  details?: ErrorDetail[];
}

export interface ErrorResponse<TCode extends string = ErrorCode> {
  error: ErrorBody<TCode>;
  requestId?: string;
}
