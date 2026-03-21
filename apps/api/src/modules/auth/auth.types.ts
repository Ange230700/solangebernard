import type { StoredAdminUser } from '../admin-users/admin-users.types';

export interface AuthenticatedSessionResult {
  user: StoredAdminUser;
  session: {
    issuedAt: Date;
    expiresAt: Date;
  };
}
