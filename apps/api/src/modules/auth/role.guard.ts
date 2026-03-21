import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AdminRole } from '@repo/contracts';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedAdminRequest } from './auth-request.types';
import { AUTHORIZED_ROLES_KEY } from './roles.decorator';

const FORBIDDEN_CODE = 'Forbidden' as const;
const UNAUTHORIZED_CODE = 'Unauthorized' as const;

const ROLE_PRIORITY: Record<AdminRole, number> = {
  staff: 0,
  admin: 1,
};

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<AdminRole[]>(AUTHORIZED_ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();
    const authenticatedAdminUser = request.authenticatedAdminUser;

    if (!authenticatedAdminUser) {
      throw new UnauthorizedException({
        code: UNAUTHORIZED_CODE,
        message: 'Authentication required',
      });
    }

    if (!hasRequiredRole(authenticatedAdminUser.role, requiredRoles)) {
      throw new ForbiddenException({
        code: FORBIDDEN_CODE,
        message: 'Insufficient role',
      });
    }

    return true;
  }
}

function hasRequiredRole(
  userRole: AdminRole,
  requiredRoles: readonly AdminRole[],
): boolean {
  const minimumRequiredPriority = Math.min(
    ...requiredRoles.map((role) => ROLE_PRIORITY[role]),
  );

  return ROLE_PRIORITY[userRole] >= minimumRequiredPriority;
}
