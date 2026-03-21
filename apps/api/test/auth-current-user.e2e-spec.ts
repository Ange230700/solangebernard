import { Module } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../src/config/api-config.service';
import type { StoredAdminUser } from '../src/modules/admin-users/admin-users.types';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import type {
  CreateAuthSessionInput,
  StoredAuthSession,
} from '../src/modules/auth/auth-sessions.types';
import { AuthSessionsRepository } from '../src/modules/auth/auth-sessions.repository';
import { AuthSessionsService } from '../src/modules/auth/auth-sessions.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthGuard } from '../src/modules/auth/auth.guard';
import { AuthService } from '../src/modules/auth/auth.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { PasswordResetTokensService } from '../src/modules/auth/password-reset-tokens.service';
import { configureApp } from '../src/app.setup';

interface CurrentUserResponseBody {
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
  };
}

describe('Current user endpoint (e2e)', () => {
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
  let authSessionsRepository: {
    create: jest.Mock;
    findActiveByTokenHash: jest.Mock;
  };
  let passwordHashingService: {
    verifyPassword: jest.Mock;
  };
  let passwordResetTokensService: {
    create: jest.Mock;
  };
  let apiConfigService: {
    appEnv: 'local';
    authSecret: string;
  };
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const storedSessions = new Map<
      string,
      {
        session: StoredAuthSession;
        user: StoredAdminUser;
      }
    >();

    adminUsersService = {
      findByEmail: jest.fn().mockResolvedValue(activeAdminUser),
    };
    authSessionsRepository = {
      create: jest.fn((input: CreateAuthSessionInput) => {
        const createdAt = new Date(
          input.expiresAt.getTime() - 12 * 60 * 60 * 1000,
        );
        const storedSession: StoredAuthSession = {
          id: `session_${storedSessions.size + 1}`,
          adminUserId: input.adminUserId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          invalidatedAt: null,
          createdAt,
          updatedAt: createdAt,
        };

        storedSessions.set(input.tokenHash, {
          session: storedSession,
          user: activeAdminUser,
        });

        return Promise.resolve(storedSession);
      }),
      findActiveByTokenHash: jest.fn((tokenHash: string, at: Date) => {
        const storedSession = storedSessions.get(tokenHash);

        if (!storedSession) {
          return Promise.resolve(null);
        }

        if (
          storedSession.session.invalidatedAt ||
          storedSession.session.expiresAt <= at
        ) {
          return Promise.resolve(null);
        }

        return Promise.resolve(storedSession);
      }),
    };
    passwordHashingService = {
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    passwordResetTokensService = {
      create: jest.fn(),
    };
    apiConfigService = {
      appEnv: 'local',
      authSecret: 'local-dev-auth-secret-123',
    };

    @Module({
      controllers: [AuthController],
      providers: [
        AuthGuard,
        AuthService,
        AuthSessionsService,
        {
          provide: AdminUsersService,
          useValue: adminUsersService,
        },
        {
          provide: AuthSessionsRepository,
          useValue: authSessionsRepository,
        },
        {
          provide: PasswordHashingService,
          useValue: passwordHashingService,
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
    class CurrentUserTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CurrentUserTestModule],
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

  it('returns the authenticated current user and active session metadata', async () => {
    const sessionCookie = await loginAndReadCookie();

    const response = await app.inject({
      method: 'GET',
      url: '/auth/current-user',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<CurrentUserResponseBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.user).toEqual({
      id: 'admin_user_1',
      email: 'admin@solangebernard.com',
      role: 'admin',
      isActive: true,
    });
    expect(body.session.transport).toBe('cookie');
    expect(typeof body.session.issuedAt).toBe('string');
    expect(typeof body.session.expiresAt).toBe('string');
    expect(Number.isNaN(new Date(body.session.issuedAt).getTime())).toBe(false);
    expect(Number.isNaN(new Date(body.session.expiresAt).getTime())).toBe(
      false,
    );
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
    expect(
      new Date(body.session.expiresAt).getTime() -
        new Date(body.session.issuedAt).getTime(),
    ).toBe(12 * 60 * 60 * 1000);
  });

  it('rejects requests without an authenticated session cookie', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/auth/current-user',
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(401);
    expect(body).toEqual({
      error: {
        code: 'Unauthorized',
        message: 'Authentication required',
      },
    });
  });

  async function loginAndReadCookie(): Promise<string> {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'admin@solangebernard.com',
        password: 'SecurePass123!',
      },
    });

    return readSetCookieHeader(response.headers['set-cookie']);
  }
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
