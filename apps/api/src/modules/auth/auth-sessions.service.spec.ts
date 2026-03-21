import type { StoredAdminUser } from '../admin-users/admin-users.types';
import { hashAuthSessionToken } from './auth-session-token';
import { AuthSessionsService } from './auth-sessions.service';
import type { CreateAuthSessionInput } from './auth-sessions.types';

describe('AuthSessionsService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-21T17:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a persisted session token for an admin user', async () => {
    const create = jest
      .fn<Promise<{ id: string }>, [CreateAuthSessionInput]>()
      .mockResolvedValue({
        id: 'session_1',
      });
    const authSessionsRepository = {
      create,
    };
    const apiConfigService = {
      authSecret: 'local-dev-auth-secret-123',
    };
    const service = new AuthSessionsService(
      authSessionsRepository as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[1],
    );

    const session = await service.create('admin_user_1');
    const [createInput] = create.mock.calls[0] ?? [];

    expect(session.token).toMatch(/^[a-f0-9]{64}$/);
    expect(session.issuedAt).toEqual(new Date('2026-03-21T17:30:00.000Z'));
    expect(session.expiresAt).toEqual(new Date('2026-03-22T05:30:00.000Z'));
    expect(createInput).toBeDefined();
    expect(createInput?.adminUserId).toBe('admin_user_1');
    expect(createInput?.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createInput?.expiresAt).toEqual(
      new Date('2026-03-22T05:30:00.000Z'),
    );
  });

  it('finds authenticated sessions from the raw cookie token', async () => {
    const activeAdminUser: StoredAdminUser = {
      id: 'admin_user_1',
      email: 'admin@solangebernard.com',
      passwordHash: 'stored-password-hash',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2026-03-21T16:00:00.000Z'),
      updatedAt: new Date('2026-03-21T16:00:00.000Z'),
    };
    const findActiveByTokenHash = jest.fn().mockResolvedValue({
      session: {
        id: 'session_1',
        adminUserId: 'admin_user_1',
        tokenHash: hashAuthSessionToken(
          'raw-session-token',
          'local-dev-auth-secret-123',
        ),
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        invalidatedAt: null,
        createdAt: new Date('2026-03-21T17:30:00.000Z'),
        updatedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
      user: activeAdminUser,
    });
    const authSessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash,
    };
    const apiConfigService = {
      authSecret: 'local-dev-auth-secret-123',
    };
    const service = new AuthSessionsService(
      authSessionsRepository as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[1],
    );

    await expect(
      service.findAuthenticatedSession('raw-session-token'),
    ).resolves.toEqual({
      session: {
        id: 'session_1',
        adminUserId: 'admin_user_1',
        tokenHash: hashAuthSessionToken(
          'raw-session-token',
          'local-dev-auth-secret-123',
        ),
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        invalidatedAt: null,
        createdAt: new Date('2026-03-21T17:30:00.000Z'),
        updatedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
      user: activeAdminUser,
    });
    expect(findActiveByTokenHash).toHaveBeenCalledWith(
      hashAuthSessionToken('raw-session-token', 'local-dev-auth-secret-123'),
      new Date('2026-03-21T17:30:00.000Z'),
    );
  });

  it('rejects sessions for users that are no longer active', async () => {
    const findActiveByTokenHash = jest.fn().mockResolvedValue({
      session: {
        id: 'session_1',
        adminUserId: 'admin_user_1',
        tokenHash: hashAuthSessionToken(
          'raw-session-token',
          'local-dev-auth-secret-123',
        ),
        expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        invalidatedAt: null,
        createdAt: new Date('2026-03-21T17:30:00.000Z'),
        updatedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
      user: {
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        passwordHash: 'stored-password-hash',
        role: 'staff',
        isActive: false,
        createdAt: new Date('2026-03-21T16:00:00.000Z'),
        updatedAt: new Date('2026-03-21T16:00:00.000Z'),
      },
    });
    const authSessionsRepository = {
      create: jest.fn(),
      findActiveByTokenHash,
    };
    const apiConfigService = {
      authSecret: 'local-dev-auth-secret-123',
    };
    const service = new AuthSessionsService(
      authSessionsRepository as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof AuthSessionsService
      >[1],
    );

    await expect(
      service.findAuthenticatedSession('raw-session-token'),
    ).resolves.toBeNull();
  });
});
