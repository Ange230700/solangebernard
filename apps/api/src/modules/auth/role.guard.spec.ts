import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { StoredAdminUser } from '../admin-users/admin-users.types';
import type { AuthenticatedAdminRequest } from './auth-request.types';
import { RoleGuard } from './role.guard';

describe('RoleGuard', () => {
  const adminUser: StoredAdminUser = {
    id: 'admin_user_1',
    email: 'admin@solangebernard.com',
    passwordHash: 'stored-password-hash',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-03-21T16:00:00.000Z'),
    updatedAt: new Date('2026-03-21T16:00:00.000Z'),
  };
  const staffUser: StoredAdminUser = {
    ...adminUser,
    id: 'staff_user_1',
    email: 'staff@solangebernard.com',
    role: 'staff',
  };

  it('allows access when no role metadata is set', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    };
    const guard = new RoleGuard(
      reflector as unknown as ConstructorParameters<typeof RoleGuard>[0],
    );

    expect(guard.canActivate(createExecutionContext({}))).toBe(true);
  });

  it('rejects protected routes when the authenticated user is missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['staff']),
    };
    const guard = new RoleGuard(
      reflector as unknown as ConstructorParameters<typeof RoleGuard>[0],
    );

    expect(() => guard.canActivate(createExecutionContext({}))).toThrow(
      UnauthorizedException,
    );
    expect(() => guard.canActivate(createExecutionContext({}))).toThrow(
      'Authentication required',
    );
  });

  it('allows staff routes for staff users', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['staff']),
    };
    const guard = new RoleGuard(
      reflector as unknown as ConstructorParameters<typeof RoleGuard>[0],
    );

    expect(
      guard.canActivate(
        createExecutionContext({
          authenticatedAdminUser: staffUser,
        }),
      ),
    ).toBe(true);
  });

  it('allows staff routes for admin users because admin is a superset of staff', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['staff']),
    };
    const guard = new RoleGuard(
      reflector as unknown as ConstructorParameters<typeof RoleGuard>[0],
    );

    expect(
      guard.canActivate(
        createExecutionContext({
          authenticatedAdminUser: adminUser,
        }),
      ),
    ).toBe(true);
  });

  it('rejects admin-only routes for staff users', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['admin']),
    };
    const guard = new RoleGuard(
      reflector as unknown as ConstructorParameters<typeof RoleGuard>[0],
    );

    expect(() =>
      guard.canActivate(
        createExecutionContext({
          authenticatedAdminUser: staffUser,
        }),
      ),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.canActivate(
        createExecutionContext({
          authenticatedAdminUser: staffUser,
        }),
      ),
    ).toThrow('Insufficient role');
  });
});

function createExecutionContext(
  request: Partial<AuthenticatedAdminRequest>,
): ExecutionContext {
  return {
    getClass: () => RoleGuard,
    getHandler: () => createExecutionContext,
    switchToHttp: () => ({
      getRequest: <T>() => request as T,
    }),
  } as unknown as ExecutionContext;
}
