import { Controller, Get, Module, Req, UseGuards } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiConfigService } from '../src/config/api-config.service';
import type { StoredAdminUser } from '../src/modules/admin-users/admin-users.types';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AuthGuard } from '../src/modules/auth/auth.guard';
import type { AuthenticatedAdminRequest } from '../src/modules/auth/auth-request.types';
import { AUTH_SESSION_COOKIE_NAME } from '../src/modules/auth/auth-session.constants';
import type {
  CreateAuthSessionInput,
  StoredAuthSession,
} from '../src/modules/auth/auth-sessions.types';
import { AuthSessionsRepository } from '../src/modules/auth/auth-sessions.repository';
import { AuthSessionsService } from '../src/modules/auth/auth-sessions.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { configureApp } from '../src/app.setup';

interface LogoutResponseBody {
  success: true;
}

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
  };
}

@Controller('protected-after-logout')
@UseGuards(AuthGuard)
class ProtectedAfterLogoutController {
  @Get()
  getProtected(@Req() request: AuthenticatedAdminRequest) {
    return {
      userId: request.authenticatedAdminUser?.id,
    };
  }
}

describe('Auth logout endpoint (e2e)', () => {
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
    invalidateById: jest.Mock;
  };
  let passwordHashingService: {
    verifyPassword: jest.Mock;
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
        const storedSession: StoredAuthSession = {
          id: `session_${storedSessions.size + 1}`,
          adminUserId: input.adminUserId,
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
          invalidatedAt: null,
          createdAt: new Date('2026-03-21T17:30:00.000Z'),
          updatedAt: new Date('2026-03-21T17:30:00.000Z'),
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
      invalidateById: jest.fn((sessionId: string, invalidatedAt: Date) => {
        for (const storedSession of storedSessions.values()) {
          if (storedSession.session.id !== sessionId) {
            continue;
          }

          storedSession.session = {
            ...storedSession.session,
            invalidatedAt,
            updatedAt: invalidatedAt,
          };

          return Promise.resolve(storedSession.session);
        }

        throw new Error(`Unknown session id ${sessionId}`);
      }),
    };
    passwordHashingService = {
      verifyPassword: jest.fn().mockResolvedValue(true),
    };
    apiConfigService = {
      appEnv: 'local',
      authSecret: 'local-dev-auth-secret-123',
    };

    @Module({
      controllers: [AuthController, ProtectedAfterLogoutController],
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
          provide: ApiConfigService,
          useValue: apiConfigService,
        },
      ],
    })
    class AuthLogoutTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthLogoutTestModule],
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

  it('logs out an authenticated user and invalidates the session', async () => {
    const sessionCookie = await loginAndReadCookie();

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        cookie: sessionCookie,
      },
    });
    const logoutBody = parseJsonBody<LogoutResponseBody>(logoutResponse.body);
    const protectedResponse = await app.inject({
      method: 'GET',
      url: '/protected-after-logout',
      headers: {
        cookie: sessionCookie,
      },
    });
    const protectedBody = parseJsonBody<ErrorResponseBody>(
      protectedResponse.body,
    );

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutBody).toEqual({ success: true });
    expect(readSetCookieHeader(logoutResponse.headers['set-cookie'])).toContain(
      `${AUTH_SESSION_COOKIE_NAME}=`,
    );
    expect(readSetCookieHeader(logoutResponse.headers['set-cookie'])).toContain(
      'Max-Age=0',
    );
    expect(authSessionsRepository.invalidateById).toHaveBeenCalledTimes(1);
    expect(protectedResponse.statusCode).toBe(401);
    expect(protectedBody).toEqual({
      error: {
        code: 'Unauthorized',
        message: 'Authentication required',
      },
    });
  });

  it('rejects logout when no authenticated session cookie is present', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/logout',
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(401);
    expect(body).toEqual({
      error: {
        code: 'Unauthorized',
        message: 'Authentication required',
      },
    });
    expect(authSessionsRepository.invalidateById).not.toHaveBeenCalled();
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
