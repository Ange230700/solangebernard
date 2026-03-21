import type { StoredAdminUser } from '../admin-users/admin-users.types';

export interface CreateAuthSessionInput {
  adminUserId: string;
  expiresAt: Date;
  tokenHash: string;
}

export interface StoredAuthSession {
  id: string;
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  invalidatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatedAuthSession {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
}

export interface AuthenticatedAdminSession {
  session: StoredAuthSession;
  user: StoredAdminUser;
}
