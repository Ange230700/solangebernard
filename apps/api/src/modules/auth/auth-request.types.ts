import type { StoredAdminUser } from '../admin-users/admin-users.types';
import type { AuthenticatedAdminSession } from './auth-sessions.types';

export interface AuthenticatedAdminRequest {
  authenticatedAdminSession?: AuthenticatedAdminSession;
  authenticatedAdminUser?: StoredAdminUser;
  headers: {
    cookie?: string | string[];
  };
}
