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
import type {
  CreateAuthSessionInput,
  StoredAuthSession,
} from '../src/modules/auth/auth-sessions.types';
import { AuthSessionsRepository } from '../src/modules/auth/auth-sessions.repository';
import { AuthSessionsService } from '../src/modules/auth/auth-sessions.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { AuthService } from '../src/modules/auth/auth.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { RoleGuard } from '../src/modules/auth/role.guard';
import { AuthorizedRoles } from '../src/modules/auth/roles.decorator';
import { configureApp } from '../src/app.setup';

interface RoleGuardResponseBody {
  user: {
    email: string;
    role: string;
  };
}

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
  };
}

@Controller('role-probe')
@UseGuards(AuthGuard, RoleGuard)
class RoleProbeController {
  @Get('staff')
  @AuthorizedRoles('staff')
  getStaffRoute(
    @Req() request: AuthenticatedAdminRequest,
  ): RoleGuardResponseBody {
    return {
      user: {
        email: request.authenticatedAdminUser?.email ?? 'unknown',
        role: request.authenticatedAdminUser?.role ?? 'unknown',
      },
    };
  }

  @Get('admin')
  @AuthorizedRoles('admin')
  getAdminRoute(
    @Req() request: AuthenticatedAdminRequest,
  ): RoleGuardResponseBody {
    return {
      user: {
        email: request.authenticatedAdminUser?.email ?? 'unknown',
        role: request.authenticatedAdminUser?.role ?? 'unknown',
      },
    };
  }
}

describe('RoleGuard (e2e)', () => {
  const adminUser: StoredAdminUser = {
    id: 'admin_user_1',
    email: 'admin@solangebernard.com',
    passwordHash:
      'scrypt$solangebernard-dev-seed:admin:v1$03ba97ac7179594c03875372a9d0f38f393b853752e1f1cfade3c3a281a41b91c4ba8d0a3e7b6715d31a0b8fc77c142e2eda21de421f96f0905f2a73a5d899ee',
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
    const usersByEmail = new Map<string, StoredAdminUser>([
      [adminUser.email, adminUser],
      [staffUser.email, staffUser],
    ]);
    const usersById = new Map<string, StoredAdminUser>([
      [adminUser.id, adminUser],
      [staffUser.id, staffUser],
    ]);

    adminUsersService = {
      findByEmail: jest.fn((email: string) =>
        Promise.resolve(usersByEmail.get(email) ?? null),
      ),
    };
    authSessionsRepository = {
      create: jest.fn((input: CreateAuthSessionInput) => {
        const user = usersById.get(input.adminUserId);

        if (!user) {
          throw new Error(`Unknown user id ${input.adminUserId}`);
        }

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
          user,
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
    apiConfigService = {
      appEnv: 'local',
      authSecret: 'local-dev-auth-secret-123',
    };

    @Module({
      controllers: [AuthController, RoleProbeController],
      providers: [
        AuthGuard,
        AuthService,
        AuthSessionsService,
        RoleGuard,
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
    class RoleGuardTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RoleGuardTestModule],
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

  it('allows staff users on staff routes', async () => {
    const sessionCookie = await loginAs('staff@solangebernard.com');
    const response = await app.inject({
      method: 'GET',
      url: '/role-probe/staff',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<RoleGuardResponseBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      user: {
        email: 'staff@solangebernard.com',
        role: 'staff',
      },
    });
  });

  it('allows admin users on staff routes because admin is a strict superset of staff', async () => {
    const sessionCookie = await loginAs('admin@solangebernard.com');
    const response = await app.inject({
      method: 'GET',
      url: '/role-probe/staff',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<RoleGuardResponseBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      user: {
        email: 'admin@solangebernard.com',
        role: 'admin',
      },
    });
  });

  it('rejects staff users on admin-only routes', async () => {
    const sessionCookie = await loginAs('staff@solangebernard.com');
    const response = await app.inject({
      method: 'GET',
      url: '/role-probe/admin',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(403);
    expect(body).toEqual({
      error: {
        code: 'Forbidden',
        message: 'Insufficient role',
      },
    });
  });

  it('allows admin users on admin-only routes', async () => {
    const sessionCookie = await loginAs('admin@solangebernard.com');
    const response = await app.inject({
      method: 'GET',
      url: '/role-probe/admin',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<RoleGuardResponseBody>(response.body);

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({
      user: {
        email: 'admin@solangebernard.com',
        role: 'admin',
      },
    });
  });

  async function loginAs(email: string): Promise<string> {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email,
        password: 'SecurePass123!',
      },
    });

    return readSetCookieHeader(loginResponse.headers['set-cookie']);
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
