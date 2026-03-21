import { hashPasswordResetToken } from './password-reset-token';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import type { CreatePasswordResetTokenInput } from './password-reset-tokens.types';

describe('PasswordResetTokensService', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-03-21T17:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a persisted password reset token with a one-hour expiry', async () => {
    const create = jest
      .fn<Promise<{ id: string }>, [CreatePasswordResetTokenInput]>()
      .mockResolvedValue({
        id: 'reset_token_1',
      });
    const passwordResetTokensRepository = {
      create,
    };
    const apiConfigService = {
      authSecret: 'local-dev-auth-secret-123',
    };
    const prismaService = {
      $transaction: jest.fn(),
    };
    const service = new PasswordResetTokensService(
      passwordResetTokensRepository as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[1],
      prismaService as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[2],
    );

    const passwordResetToken = await service.create('admin_user_1');
    const [createInput] = create.mock.calls[0] ?? [];

    expect(passwordResetToken.token).toMatch(/^[a-f0-9]{64}$/);
    expect(passwordResetToken.issuedAt).toEqual(
      new Date('2026-03-21T17:30:00.000Z'),
    );
    expect(passwordResetToken.expiresAt).toEqual(
      new Date('2026-03-21T18:30:00.000Z'),
    );
    expect(createInput).toBeDefined();
    expect(createInput?.adminUserId).toBe('admin_user_1');
    expect(createInput?.tokenHash).toBe(
      hashPasswordResetToken(
        passwordResetToken.token,
        'local-dev-auth-secret-123',
      ),
    );
    expect(createInput?.expiresAt).toEqual(
      new Date('2026-03-21T18:30:00.000Z'),
    );
  });

  it('consumes a valid token and updates the matching user password atomically', async () => {
    const passwordResetTokensRepository = {
      create: jest.fn(),
    };
    const apiConfigService = {
      authSecret: 'local-dev-auth-secret-123',
    };
    const findFirst = jest.fn().mockResolvedValue({
      id: 'reset_token_1',
      adminUserId: 'admin_user_1',
    });
    const updateMany = jest.fn().mockResolvedValue({
      count: 1,
    });
    const update = jest.fn().mockResolvedValue({
      id: 'admin_user_1',
      email: 'admin@solangebernard.com',
      passwordHash: 'next-password-hash',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2026-03-21T16:00:00.000Z'),
      updatedAt: new Date('2026-03-21T17:30:00.000Z'),
    });
    type MockTransaction = {
      passwordResetToken: {
        findFirst: typeof findFirst;
        updateMany: typeof updateMany;
      };
      adminUser: {
        update: typeof update;
      };
    };
    const prismaService = {
      $transaction: jest
        .fn()
        .mockImplementation(
          (callback: (tx: MockTransaction) => Promise<unknown>) =>
            callback({
              passwordResetToken: {
                findFirst,
                updateMany,
              },
              adminUser: {
                update,
              },
            }),
        ),
    };
    const service = new PasswordResetTokensService(
      passwordResetTokensRepository as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[1],
      prismaService as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[2],
    );

    await expect(
      service.consumeAndUpdatePassword(
        'valid-raw-password-reset-token',
        'next-password-hash',
      ),
    ).resolves.toEqual({
      id: 'admin_user_1',
      email: 'admin@solangebernard.com',
      passwordHash: 'next-password-hash',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2026-03-21T16:00:00.000Z'),
      updatedAt: new Date('2026-03-21T17:30:00.000Z'),
    });
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        tokenHash: hashPasswordResetToken(
          'valid-raw-password-reset-token',
          'local-dev-auth-secret-123',
        ),
        consumedAt: null,
        expiresAt: {
          gt: new Date('2026-03-21T17:30:00.000Z'),
        },
      },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'reset_token_1',
        consumedAt: null,
        expiresAt: {
          gt: new Date('2026-03-21T17:30:00.000Z'),
        },
      },
      data: {
        consumedAt: new Date('2026-03-21T17:30:00.000Z'),
      },
    });
    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'admin_user_1',
      },
      data: {
        passwordHash: 'next-password-hash',
      },
    });
  });
});
