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
import { AuthGuard } from '../src/modules/auth/auth.guard';
import type {
  CreateAuthSessionInput,
  StoredAuthSession,
} from '../src/modules/auth/auth-sessions.types';
import { AuthSessionsRepository } from '../src/modules/auth/auth-sessions.repository';
import { AuthSessionsService } from '../src/modules/auth/auth-sessions.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { PasswordHashingService } from '../src/modules/auth/password-hashing.service';
import { hashPasswordResetToken } from '../src/modules/auth/password-reset-token';
import { PasswordResetTokensRepository } from '../src/modules/auth/password-reset-tokens.repository';
import { PasswordResetTokensService } from '../src/modules/auth/password-reset-tokens.service';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/persistence/prisma.service';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
  };
}

interface ResetTokenRecord {
  id: string;
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

describe('Password reset session invalidation (e2e)', () => {
  const rawPasswordResetToken = 'valid-password-reset-token';
  const authSecret = 'local-dev-auth-secret-123';
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

  let currentUser: StoredAdminUser;
  let adminUsersService: {
    findByEmail: jest.Mock;
  };
  let authSessionsRepository: {
    create: jest.Mock;
    findActiveByTokenHash: jest.Mock;
  };
  let passwordHashingService: {
    verifyPassword: jest.Mock;
    hashPassword: jest.Mock;
  };
  let passwordResetTokensRepository: {
    create: jest.Mock;
  };
  let prismaService: {
    $transaction: jest.Mock;
  };
  let apiConfigService: {
    appEnv: 'local';
    authSecret: string;
  };
  let app: NestFastifyApplication;

  beforeEach(async () => {
    currentUser = {
      ...activeStaffUser,
    };

    const storedSessions = new Map<string, StoredAuthSession>();
    const storedResetToken: ResetTokenRecord = {
      id: 'reset_token_1',
      adminUserId: currentUser.id,
      tokenHash: hashPasswordResetToken(rawPasswordResetToken, authSecret),
      expiresAt: new Date('2026-03-22T18:30:00.000Z'),
      consumedAt: null,
      createdAt: new Date('2026-03-21T17:00:00.000Z'),
      updatedAt: new Date('2026-03-21T17:00:00.000Z'),
    };

    adminUsersService = {
      findByEmail: jest.fn().mockImplementation((email: string) => {
        if (email === currentUser.email) {
          return Promise.resolve(currentUser);
        }

        return Promise.resolve(null);
      }),
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

        storedSessions.set(input.tokenHash, storedSession);

        return Promise.resolve(storedSession);
      }),
      findActiveByTokenHash: jest.fn((tokenHash: string, at: Date) => {
        const storedSession = storedSessions.get(tokenHash);

        if (!storedSession) {
          return Promise.resolve(null);
        }

        if (
          storedSession.invalidatedAt !== null ||
          storedSession.expiresAt <= at
        ) {
          return Promise.resolve(null);
        }

        return Promise.resolve({
          session: storedSession,
          user: currentUser,
        });
      }),
    };
    passwordHashingService = {
      verifyPassword: jest.fn().mockResolvedValue(true),
      hashPassword: jest.fn().mockResolvedValue('next-password-hash'),
    };
    passwordResetTokensRepository = {
      create: jest.fn(),
    };
    prismaService = {
      $transaction: jest.fn().mockImplementation(
        async (
          callback: (transaction: {
            passwordResetToken: {
              findFirst: (args: {
                where: {
                  tokenHash: string;
                  consumedAt: null;
                  expiresAt: { gt: Date };
                };
              }) => Promise<ResetTokenRecord | null>;
              updateMany: (args: {
                where: {
                  id: string;
                  consumedAt: null;
                  expiresAt: { gt: Date };
                };
                data: { consumedAt: Date };
              }) => Promise<{ count: number }>;
            };
            adminUser: {
              update: (args: {
                where: { id: string };
                data: { passwordHash: string };
              }) => Promise<StoredAdminUser>;
            };
            adminSession: {
              updateMany: (args: {
                where: { adminUserId: string; invalidatedAt: null };
                data: { invalidatedAt: Date };
              }) => Promise<{ count: number }>;
            };
          }) => Promise<unknown>,
        ) =>
          callback({
            passwordResetToken: {
              findFirst: ({ where }) => {
                const isUsable =
                  storedResetToken.tokenHash === where.tokenHash &&
                  storedResetToken.consumedAt === null &&
                  storedResetToken.expiresAt > where.expiresAt.gt;

                return Promise.resolve(isUsable ? storedResetToken : null);
              },
              updateMany: ({ where, data }) => {
                const isMatch =
                  storedResetToken.id === where.id &&
                  storedResetToken.consumedAt === null &&
                  storedResetToken.expiresAt > where.expiresAt.gt;

                if (!isMatch) {
                  return Promise.resolve({ count: 0 });
                }

                storedResetToken.consumedAt = data.consumedAt;
                storedResetToken.updatedAt = data.consumedAt;

                return Promise.resolve({ count: 1 });
              },
            },
            adminUser: {
              update: ({ where, data }) => {
                currentUser = {
                  ...currentUser,
                  id: where.id,
                  passwordHash: data.passwordHash,
                  updatedAt: new Date('2026-03-21T17:30:00.000Z'),
                };

                return Promise.resolve(currentUser);
              },
            },
            adminSession: {
              updateMany: ({ where, data }) => {
                let count = 0;

                for (const storedSession of storedSessions.values()) {
                  if (
                    storedSession.adminUserId === where.adminUserId &&
                    storedSession.invalidatedAt === null
                  ) {
                    storedSession.invalidatedAt = data.invalidatedAt;
                    storedSession.updatedAt = data.invalidatedAt;
                    count += 1;
                  }
                }

                return Promise.resolve({ count });
              },
            },
          }),
      ),
    };
    apiConfigService = {
      appEnv: 'local',
      authSecret,
    };

    @Module({
      controllers: [AuthController],
      providers: [
        AuthGuard,
        AuthService,
        AuthSessionsService,
        PasswordResetTokensService,
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
          provide: PasswordResetTokensRepository,
          useValue: passwordResetTokensRepository,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: ApiConfigService,
          useValue: apiConfigService,
        },
      ],
    })
    class AuthPasswordResetSessionInvalidationTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthPasswordResetSessionInvalidationTestModule],
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

  it('invalidates prior authenticated sessions after a successful password reset', async () => {
    const sessionCookie = await loginAndReadCookie();

    const resetResponse = await app.inject({
      method: 'POST',
      url: '/auth/password-reset/confirm',
      payload: {
        token: rawPasswordResetToken,
        newPassword: 'NewSecurePass123!',
      },
    });

    expect(resetResponse.statusCode).toBe(200);

    const currentUserResponse = await app.inject({
      method: 'GET',
      url: '/auth/current-user',
      headers: {
        cookie: sessionCookie,
      },
    });
    const body = parseJsonBody<ErrorResponseBody>(currentUserResponse.body);

    expect(currentUserResponse.statusCode).toBe(401);
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
        email: 'staff@solangebernard.com',
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
