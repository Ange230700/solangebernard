import type { EmailAddress, EntityId } from '../shared.js';

export type AdminRole = 'staff' | 'admin';

export interface AuthenticatedAdminUser {
  id: EntityId;
  email: EmailAddress;
  role: AdminRole;
  isActive: boolean;
}

export interface LoginRequest {
  email: EmailAddress;
  password: string;
}

export interface LoginResponse {
  user: AuthenticatedAdminUser;
}

export interface CurrentUserResponse {
  user: AuthenticatedAdminUser;
}

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
