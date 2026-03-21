import type { AdminRole, EmailAddress, EntityId } from '@repo/contracts';

export interface StoredAdminUser {
  id: EntityId;
  email: EmailAddress;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAdminUserInput {
  email: EmailAddress;
  passwordHash: string;
  role: AdminRole;
  isActive?: boolean;
}
