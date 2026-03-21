import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import type { StoredAdminUser } from '../admin-users/admin-users.types';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const activeAdminUser: StoredAdminUser = {
    id: 'admin_user_1',
    email: 'admin@solangebernard.com',
    passwordHash:
      'scrypt$solangebernard-dev-seed:admin:v1$03ba97ac7179594c03875372a9d0f38f393b853752e1f1cfade3c3a281a41b91c4ba8d0a3e7b6715d31a0b8fc77c142e2eda21de421f96f0905f2a73a5d899ee',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-03-21T16:00:00.000Z'),
    updatedAt: new Date('2026-03-21T16:00:00.000Z'),
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-21T17:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('authenticates active users and returns session metadata', async () => {
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(activeAdminUser),
    };
    const authSessionsService = {
      create: jest.fn().mockResolvedValue({
        token: 'raw-session-token',
        issuedAt: new Date('2026-03-21T17:30:00.000Z'),
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
      }),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(
      service.login({
        email: ' Admin@SolangeBernard.com ',
        password: 'SecurePass123!',
      }),
    ).resolves.toEqual({
      user: activeAdminUser,
      session: {
        token: 'raw-session-token',
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        issuedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
    });
    expect(adminUsersService.findByEmail).toHaveBeenCalledWith(
      'admin@solangebernard.com',
    );
    expect(passwordHashingService.verifyPassword).toHaveBeenCalledWith(
      'SecurePass123!',
      activeAdminUser.passwordHash,
    );
    expect(authSessionsService.create).toHaveBeenCalledWith('admin_user_1');
  });

  it('rejects unknown email addresses as invalid credentials', async () => {
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    const authSessionsService = {
      create: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    const exception = await service
      .login({
        email: 'unknown@solangebernard.com',
        password: 'SecurePass123!',
      })
      .catch((error: unknown) => error);

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect((exception as UnauthorizedException).getStatus()).toBe(401);
    expect((exception as UnauthorizedException).getResponse()).toEqual({
      code: 'InvalidCredentials',
      message: 'Invalid credentials',
    });
    expect(authSessionsService.create).not.toHaveBeenCalled();
    expect(passwordHashingService.verifyPassword).not.toHaveBeenCalled();
  });

  it('rejects wrong passwords as invalid credentials', async () => {
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(activeAdminUser),
    };
    const authSessionsService = {
      create: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn().mockResolvedValue(false),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    const exception = await service
      .login({
        email: 'admin@solangebernard.com',
        password: 'WrongPass999!',
      })
      .catch((error: unknown) => error);

    expect(exception).toBeInstanceOf(UnauthorizedException);
    expect((exception as UnauthorizedException).getResponse()).toEqual({
      code: 'InvalidCredentials',
      message: 'Invalid credentials',
    });
    expect(passwordHashingService.verifyPassword).toHaveBeenCalledWith(
      'WrongPass999!',
      activeAdminUser.passwordHash,
    );
    expect(authSessionsService.create).not.toHaveBeenCalled();
  });

  it('rejects disabled accounts with the shared account-disabled error', async () => {
    const disabledAdminUser: StoredAdminUser = {
      ...activeAdminUser,
      email: 'disabled@solangebernard.com',
      isActive: false,
      role: 'staff',
    };
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(disabledAdminUser),
    };
    const authSessionsService = {
      create: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    const exception = await service
      .login({
        email: 'disabled@solangebernard.com',
        password: 'SecurePass123!',
      })
      .catch((error: unknown) => error);

    expect(exception).toBeInstanceOf(ForbiddenException);
    expect((exception as ForbiddenException).getStatus()).toBe(403);
    expect((exception as ForbiddenException).getResponse()).toEqual({
      code: 'AccountDisabled',
      message: 'Account disabled',
    });
    expect(authSessionsService.create).not.toHaveBeenCalled();
    expect(passwordHashingService.verifyPassword).not.toHaveBeenCalled();
  });

  it('invalidates the current authenticated session on logout', async () => {
    const adminUsersService = {
      findByEmail: jest.fn(),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn().mockResolvedValue(undefined),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(service.logout('session_1')).resolves.toBeUndefined();
    expect(authSessionsService.invalidateById).toHaveBeenCalledWith(
      'session_1',
    );
  });

  it('accepts password reset requests for active users', async () => {
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(activeAdminUser),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn().mockResolvedValue({
        token: 'raw-password-reset-token',
        issuedAt: new Date('2026-03-21T17:30:00.000Z'),
        expiresAt: new Date('2026-03-21T18:30:00.000Z'),
      }),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(
      service.requestPasswordReset({
        email: ' Staff@SolangeBernard.com ',
      }),
    ).resolves.toBeUndefined();
    expect(adminUsersService.findByEmail).toHaveBeenCalledWith(
      'staff@solangebernard.com',
    );
    expect(passwordResetTokensService.create).toHaveBeenCalledWith(
      'admin_user_1',
    );
  });

  it('accepts password reset requests for unknown email addresses', async () => {
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(
      service.requestPasswordReset({
        email: 'unknown@solangebernard.com',
      }),
    ).resolves.toBeUndefined();
    expect(adminUsersService.findByEmail).toHaveBeenCalledWith(
      'unknown@solangebernard.com',
    );
    expect(passwordResetTokensService.create).not.toHaveBeenCalled();
  });

  it('accepts password reset requests for disabled accounts without exposing account state', async () => {
    const disabledAdminUser: StoredAdminUser = {
      ...activeAdminUser,
      email: 'disabled@solangebernard.com',
      isActive: false,
      role: 'staff',
    };
    const adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(disabledAdminUser),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(
      service.requestPasswordReset({
        email: 'disabled@solangebernard.com',
      }),
    ).resolves.toBeUndefined();
    expect(adminUsersService.findByEmail).toHaveBeenCalledWith(
      'disabled@solangebernard.com',
    );
    expect(passwordResetTokensService.create).not.toHaveBeenCalled();
  });

  it('confirms password reset for a valid token and strong replacement password', async () => {
    const updatedAdminUser: StoredAdminUser = {
      ...activeAdminUser,
      passwordHash: 'next-password-hash',
      updatedAt: new Date('2026-03-21T18:30:00.000Z'),
    };
    const adminUsersService = {
      findByEmail: jest.fn(),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
      consumeAndUpdatePassword: jest.fn().mockResolvedValue(updatedAdminUser),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
      hashPassword: jest.fn().mockResolvedValue('next-password-hash'),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    await expect(
      service.confirmPasswordReset({
        token: 'valid-password-reset-token',
        newPassword: 'NewSecurePass123!',
      }),
    ).resolves.toEqual(updatedAdminUser);
    expect(passwordHashingService.hashPassword).toHaveBeenCalledWith(
      'NewSecurePass123!',
    );
    expect(
      passwordResetTokensService.consumeAndUpdatePassword,
    ).toHaveBeenCalledWith('valid-password-reset-token', 'next-password-hash');
  });

  it('rejects invalid or expired password reset tokens', async () => {
    const adminUsersService = {
      findByEmail: jest.fn(),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
      consumeAndUpdatePassword: jest.fn().mockResolvedValue(null),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
      hashPassword: jest.fn().mockResolvedValue('next-password-hash'),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    const exception = await service
      .confirmPasswordReset({
        token: 'expired-password-reset-token',
        newPassword: 'NewSecurePass123!',
      })
      .catch((error: unknown) => error);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect((exception as BadRequestException).getStatus()).toBe(400);
    expect((exception as BadRequestException).getResponse()).toEqual({
      code: 'InvalidOrExpiredPasswordResetToken',
      message: 'Invalid or expired password reset token',
    });
    expect(passwordHashingService.hashPassword).toHaveBeenCalledWith(
      'NewSecurePass123!',
    );
    expect(
      passwordResetTokensService.consumeAndUpdatePassword,
    ).toHaveBeenCalledWith(
      'expired-password-reset-token',
      'next-password-hash',
    );
  });

  it('rejects weak replacement passwords before hashing or token lookup', async () => {
    const adminUsersService = {
      findByEmail: jest.fn(),
    };
    const authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    const passwordResetTokensService = {
      create: jest.fn(),
      consumeAndUpdatePassword: jest.fn(),
    };
    const passwordHashingService = {
      verifyPassword: jest.fn(),
      hashPassword: jest.fn(),
    };
    const service = new AuthService(
      adminUsersService as unknown as ConstructorParameters<
        typeof AuthService
      >[0],
      passwordHashingService as unknown as ConstructorParameters<
        typeof AuthService
      >[1],
      authSessionsService as unknown as ConstructorParameters<
        typeof AuthService
      >[2],
      passwordResetTokensService as unknown as ConstructorParameters<
        typeof AuthService
      >[3],
    );

    const exception = await service
      .confirmPasswordReset({
        token: 'valid-password-reset-token',
        newPassword: '123',
      })
      .catch((error: unknown) => error);

    expect(exception).toBeInstanceOf(BadRequestException);
    expect((exception as BadRequestException).getStatus()).toBe(400);
    expect((exception as BadRequestException).getResponse()).toEqual({
      code: 'WeakPassword',
      message: 'Password does not meet strength requirements',
    });
    expect(passwordHashingService.hashPassword).not.toHaveBeenCalled();
    expect(
      passwordResetTokensService.consumeAndUpdatePassword,
    ).not.toHaveBeenCalled();
  });
});
