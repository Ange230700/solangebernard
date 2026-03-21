import { AuthSessionsRepository } from './auth-sessions.repository';
import type {
  AuthenticatedAdminSession,
  CreateAuthSessionInput,
  StoredAuthSession,
} from './auth-sessions.types';

describe('AuthSessionsRepository', () => {
  it('creates hashed admin sessions in persistence', async () => {
    const storedSession: StoredAuthSession = {
      id: 'session_1',
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-session-token',
      expiresAt: new Date('2026-03-22T05:30:00.000Z'),
      invalidatedAt: null,
      createdAt: new Date('2026-03-21T17:30:00.000Z'),
      updatedAt: new Date('2026-03-21T17:30:00.000Z'),
    };
    const create = jest.fn().mockResolvedValue(storedSession);
    const repository = new AuthSessionsRepository(
      createPrismaServiceMock({ create }),
    );
    const input: CreateAuthSessionInput = {
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-session-token',
      expiresAt: new Date('2026-03-22T05:30:00.000Z'),
    };

    await expect(repository.create(input)).resolves.toEqual(storedSession);
    expect(create).toHaveBeenCalledWith({
      data: {
        adminUserId: 'admin_user_1',
        tokenHash: 'hashed-session-token',
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
      },
    });
  });

  it('finds active sessions with their authenticated admin user', async () => {
    const authenticatedSession: AuthenticatedAdminSession = {
      session: {
        id: 'session_1',
        adminUserId: 'admin_user_1',
        tokenHash: 'hashed-session-token',
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        invalidatedAt: null,
        createdAt: new Date('2026-03-21T17:30:00.000Z'),
        updatedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
      user: {
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        passwordHash: 'stored-password-hash',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-03-21T16:00:00.000Z'),
        updatedAt: new Date('2026-03-21T16:00:00.000Z'),
      },
    };
    const findFirst = jest.fn().mockResolvedValue({
      ...authenticatedSession.session,
      adminUser: authenticatedSession.user,
    });
    const repository = new AuthSessionsRepository(
      createPrismaServiceMock({ findFirst }),
    );
    const at = new Date('2026-03-21T17:30:00.000Z');

    await expect(
      repository.findActiveByTokenHash('hashed-session-token', at),
    ).resolves.toEqual(authenticatedSession);
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: 'hashed-session-token',
        invalidatedAt: null,
        expiresAt: {
          gt: at,
        },
      },
      include: {
        adminUser: true,
      },
    });
  });

  it('invalidates an existing session by id', async () => {
    const update = jest.fn().mockResolvedValue({
      id: 'session_1',
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-session-token',
      expiresAt: new Date('2026-03-22T05:30:00.000Z'),
      invalidatedAt: new Date('2026-03-21T18:00:00.000Z'),
      createdAt: new Date('2026-03-21T17:30:00.000Z'),
      updatedAt: new Date('2026-03-21T18:00:00.000Z'),
    });
    const repository = new AuthSessionsRepository(
      createPrismaServiceMock({ update }),
    );
    const invalidatedAt = new Date('2026-03-21T18:00:00.000Z');

    await expect(
      repository.invalidateById('session_1', invalidatedAt),
    ).resolves.toEqual({
      id: 'session_1',
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-session-token',
      expiresAt: new Date('2026-03-22T05:30:00.000Z'),
      invalidatedAt,
      createdAt: new Date('2026-03-21T17:30:00.000Z'),
      updatedAt: new Date('2026-03-21T18:00:00.000Z'),
    });
    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'session_1',
      },
      data: {
        invalidatedAt,
      },
    });
  });
});

function createPrismaServiceMock(overrides: {
  create?: jest.Mock;
  findFirst?: jest.Mock;
  update?: jest.Mock;
}) {
  return {
    adminSession: {
      create: overrides.create ?? jest.fn(),
      findFirst: overrides.findFirst ?? jest.fn(),
      update: overrides.update ?? jest.fn(),
    },
  } as unknown as ConstructorParameters<typeof AuthSessionsRepository>[0];
}
