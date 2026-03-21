import { AuthSessionsRepository } from './auth-sessions.repository';
import type {
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
});

function createPrismaServiceMock(overrides: { create?: jest.Mock }) {
  return {
    adminSession: {
      create: overrides.create ?? jest.fn(),
    },
  } as unknown as ConstructorParameters<typeof AuthSessionsRepository>[0];
}
