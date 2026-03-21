import type { AdminRole } from '../enums.js';
import type { EmailAddress, EntityId, IsoDateTimeString } from '../shared.js';

export const AuthSessionTransport = {
  Cookie: 'cookie',
} as const;

export type AuthSessionTransport =
  (typeof AuthSessionTransport)[keyof typeof AuthSessionTransport];

export interface AuthenticatedAdminUser {
  id: EntityId;
  email: EmailAddress;
  role: AdminRole;
  isActive: boolean;
}

export interface AuthSession {
  transport: AuthSessionTransport;
  issuedAt: IsoDateTimeString;
  expiresAt: IsoDateTimeString;
}

export interface AuthenticatedSessionResponse {
  user: AuthenticatedAdminUser;
  session: AuthSession;
}

export interface LoginRequest {
  email: EmailAddress;
  password: string;
}

export interface LoginResponse extends AuthenticatedSessionResponse {}

export interface CurrentUserResponse extends AuthenticatedSessionResponse {}

export interface LogoutResponse {
  success: true;
}

export interface RequestPasswordResetRequest {
  email: EmailAddress;
}

export interface RequestPasswordResetResponse {
  accepted: true;
}

export interface ConfirmPasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface ConfirmPasswordResetResponse {
  user: AuthenticatedAdminUser;
}
