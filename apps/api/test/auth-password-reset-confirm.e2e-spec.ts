import { Module } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../src/config/api-config.service';
import type { StoredAdminUser } from '../src/modules/admin-users/admin-users.types';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthSessionsService } from '../src/modules/auth/auth-sessions.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { PasswordResetTokensService } from '../src/modules/auth/password-reset-tokens.service';
import { configureApp } from '../src/app.setup';

interface ConfirmPasswordResetResponseBody {
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

describe('Password reset confirm endpoint (e2e)', () => {
  const activeStaffUser: StoredAdminUser = {
    id: 'admin_user_2',
    email: 'staff@solangebernard.com',
    passwordHash:
      'scrypt$solangebernard-dev-seed:staff:v1$3a88d0dbe246c6d4ccb0a6ddb5df1ea0bd25f49234dd73f69b1ab082cb9908174940ed718a5baa8cfc98c98c5c19ed5b1102511e26a16fdd7fe358b6b4ed3f43',
    role: 'staff',
    isActive: true,
    createdAt: new Date('2026-03-21T16:00:00.000Z'),
    updatedAt: new Date('2026-03-21T16:00:00.000Z'),
  };

  let adminUsersService: {
    findByEmail: jest.Mock;
  };
  let authSessionsService: {
    create: jest.Mock;
    invalidateById: jest.Mock;
  };
  let passwordHashingService: {
    verifyPassword: jest.Mock;
    hashPassword: jest.Mock;
  };
  let passwordResetTokensService: {
    create: jest.Mock;
    consumeAndUpdatePassword: jest.Mock;
  };
  let apiConfigService: {
    appEnv: 'local';
  };
  let app: NestFastifyApplication;

  beforeEach(async () => {
    adminUsersService = {
      findByEmail: jest.fn(),
    };
    authSessionsService = {
      create: jest.fn(),
      invalidateById: jest.fn(),
    };
    passwordHashingService = {
      verifyPassword: jest.fn(),
      hashPassword: jest.fn(),
    };
    passwordResetTokensService = {
      create: jest.fn(),
      consumeAndUpdatePassword: jest.fn(),
    };
    apiConfigService = {
      appEnv: 'local',
    };

    @Module({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AdminUsersService,
          useValue: adminUsersService,
        },
        {
          provide: PasswordHashingService,
          useValue: passwordHashingService,
        },
        {
          provide: AuthSessionsService,
          useValue: authSessionsService,
        },
        {
          provide: PasswordResetTokensService,
          useValue: passwordResetTokensService,
        },
        {
          provide: ApiConfigService,
          useValue: apiConfigService,
        },
      ],
    })
    class AuthPasswordResetConfirmTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthPasswordResetConfirmTestModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('confirms the password reset with a valid token and strong replacement password', async () => {
    passwordHashingService.hashPassword.mockResolvedValue('next-password-hash');
    passwordResetTokensService.consumeAndUpdatePassword.mockResolvedValue({
      ...activeStaffUser,
      passwordHash: 'next-password-hash',
      updatedAt: new Date('2026-03-21T18:30:00.000Z'),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: {
        token: 'valid-password-reset-token',
        newPassword: 'NewSecurePass123!',
      },
    });
    const body = parseJsonBody<ConfirmPasswordResetResponseBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      user: {
        id: 'admin_user_2',
        email: 'staff@solangebernard.com',
        role: 'staff',
        isActive: true,
      },
    });
    expect(passwordHashingService.hashPassword).toHaveBeenCalledWith(
      'NewSecurePass123!',
    );
    expect(
      passwordResetTokensService.consumeAndUpdatePassword,
    ).toHaveBeenCalledWith('valid-password-reset-token', 'next-password-hash');
  });

  it('returns the shared invalid-or-expired error for unusable reset tokens', async () => {
    passwordHashingService.hashPassword.mockResolvedValue('next-password-hash');
    passwordResetTokensService.consumeAndUpdatePassword.mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: {
        token: 'expired-password-reset-token',
        newPassword: 'NewSecurePass123!',
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'InvalidOrExpiredPasswordResetToken',
        message: 'Invalid or expired password reset token',
      },
    });
  });

  it('rejects weak replacement passwords before token consumption', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: {
        token: 'valid-password-reset-token',
        newPassword: '123',
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(400);
    expect(body).toEqual({
      error: {
        code: 'WeakPassword',
        message: 'Password does not meet strength requirements',
      },
    });
    expect(passwordHashingService.hashPassword).not.toHaveBeenCalled();
    expect(
      passwordResetTokensService.consumeAndUpdatePassword,
    ).not.toHaveBeenCalled();
  });

  it('validates the confirm password reset payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: {},
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: 'ValidationFailed',
        message: 'Validation failed',
      },
    });
    expect(body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'token',
        }),
        expect.objectContaining({
          field: 'newPassword',
        }),
      ]),
    );
  });
});

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}
