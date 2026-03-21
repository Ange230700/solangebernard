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
    const service = new PasswordResetTokensService(
      passwordResetTokensRepository as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[0],
      apiConfigService as unknown as ConstructorParameters<
        typeof PasswordResetTokensService
      >[1],
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
});
