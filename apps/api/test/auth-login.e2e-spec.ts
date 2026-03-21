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
import { configureApp } from '../src/app.setup';

interface LoginSuccessBody {
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  session: {
    transport: string;
    issuedAt: string;
    expiresAt: string;
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

describe('Auth login endpoint (e2e)', () => {
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

  let adminUsersService: {
    findByEmail: jest.Mock;
  };
  let authSessionsService: {
    create: jest.Mock;
  };
  let passwordHashingService: {
    verifyPassword: jest.Mock;
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
    };
    passwordHashingService = {
      verifyPassword: jest.fn(),
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
          provide: ApiConfigService,
          useValue: apiConfigService,
        },
      ],
    })
    class AuthLoginTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthLoginTestModule],
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

  it('authenticates valid credentials successfully', async () => {
    adminUsersService.findByEmail.mockResolvedValue(activeAdminUser);
    passwordHashingService.verifyPassword.mockResolvedValue(true);
    authSessionsService.create.mockResolvedValue({
      token: 'session-token-123',
      issuedAt: new Date('2026-03-21T17:30:00.000Z'),
      expiresAt: new Date('2026-03-22T05:30:00.000Z'),
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@solangebernard.com',
        password: 'SecurePass123!',
      },
    });
    const body = parseJsonBody<LoginSuccessBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      user: {
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        role: 'admin',
        isActive: true,
      },
      session: {
        transport: 'cookie',
      },
    });
    expect(typeof body.session.issuedAt).toBe('string');
    expect(typeof body.session.expiresAt).toBe('string');
    const issuedAt = new Date(body.session.issuedAt);
    const expiresAt = new Date(body.session.expiresAt);

    expect(Number.isNaN(issuedAt.getTime())).toBe(false);
    expect(Number.isNaN(expiresAt.getTime())).toBe(false);
    expect(expiresAt.getTime() - issuedAt.getTime()).toBe(12 * 60 * 60 * 1000);
    expect(readSetCookieHeader(response.headers['set-cookie'])).toContain(
      'solange_admin_session=session-token-123',
    );
    expect(readSetCookieHeader(response.headers['set-cookie'])).toContain(
      'HttpOnly',
    );
    expect(readSetCookieHeader(response.headers['set-cookie'])).toContain(
      'SameSite=Lax',
    );
    expect(readSetCookieHeader(response.headers['set-cookie'])).toContain(
      'Path=/',
    );
    expect(readSetCookieHeader(response.headers['set-cookie'])).toContain(
      'Max-Age=43200',
    );
    expect(readSetCookieHeader(response.headers['set-cookie'])).not.toContain(
      'Secure',
    );
  });

  it('returns invalid-credentials for unknown email addresses', async () => {
    adminUsersService.findByEmail.mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'unknown@solangebernard.com',
        password: 'SecurePass123!',
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(401);
    expect(body).toEqual({
      error: {
        code: 'InvalidCredentials',
        message: 'Invalid credentials',
      },
    });
  });

  it('returns account-disabled for inactive back-office users', async () => {
    adminUsersService.findByEmail.mockResolvedValue({
      ...activeAdminUser,
      email: 'disabled@solangebernard.com',
      isActive: false,
      role: 'staff',
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'disabled@solangebernard.com',
        password: 'SecurePass123!',
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(403);
    expect(body).toEqual({
      error: {
        code: 'AccountDisabled',
        message: 'Account disabled',
      },
    });
  });

  it('validates the login payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
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
        expect.objectContaining({
          field: 'password',
        }),
      ]),
    );
  });
});

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}

function readSetCookieHeader(
  setCookieHeader: string | string[] | undefined,
): string {
  if (!setCookieHeader) {
    return '';
  }

  return Array.isArray(setCookieHeader)
    ? setCookieHeader.join('; ')
    : setCookieHeader;
}
