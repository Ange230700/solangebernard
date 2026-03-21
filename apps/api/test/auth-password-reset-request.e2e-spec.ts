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

interface RequestPasswordResetResponseBody {
  accepted: true;
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

describe('Password reset request endpoint (e2e)', () => {
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
  };
  let passwordResetTokensService: {
    create: jest.Mock;
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
    };
    passwordResetTokensService = {
      create: jest.fn(),
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
    class AuthPasswordResetRequestTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthPasswordResetRequestTestModule],
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

  it('accepts a valid password reset request for an active back-office user', async () => {
    adminUsersService.findByEmail.mockResolvedValue(activeStaffUser);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: {
        email: 'Staff@SolangeBernard.com',
      },
    });
    const body = parseJsonBody<RequestPasswordResetResponseBody>(response.body);

    expect(response.statusCode).toBe(202);
    expect(body).toEqual({
      accepted: true,
    });
    expect(adminUsersService.findByEmail).toHaveBeenCalledWith(
      'staff@solangebernard.com',
    );
    expect(passwordResetTokensService.create).toHaveBeenCalledWith(
      'admin_user_2',
    );
  });

  it('accepts unknown email addresses without leaking whether an account exists', async () => {
    adminUsersService.findByEmail.mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: {
        email: 'unknown@solangebernard.com',
      },
    });
    const body = parseJsonBody<RequestPasswordResetResponseBody>(response.body);

    expect(response.statusCode).toBe(202);
    expect(body).toEqual({
      accepted: true,
    });
    expect(passwordResetTokensService.create).not.toHaveBeenCalled();
  });

  it('validates the password reset request payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/request',
      payload: {
        email: 'not-an-email',
      },
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
          field: 'email',
        }),
      ]),
    );
  });
});

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}
