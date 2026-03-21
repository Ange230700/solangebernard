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
});
