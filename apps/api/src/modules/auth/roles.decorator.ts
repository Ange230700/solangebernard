import { SetMetadata } from '@nestjs/common';
import type { AdminRole } from '@repo/contracts';

export const AUTHORIZED_ROLES_KEY = 'authorizedRoles';

export function AuthorizedRoles(...roles: AdminRole[]) {
  return SetMetadata(AUTHORIZED_ROLES_KEY, roles);
}
