import { PasswordResetTokensRepository } from './password-reset-tokens.repository';
import type {
  CreatePasswordResetTokenInput,
  StoredPasswordResetToken,
} from './password-reset-tokens.types';

describe('PasswordResetTokensRepository', () => {
  it('creates hashed password reset tokens in persistence', async () => {
    const storedToken: StoredPasswordResetToken = {
      id: 'reset_token_1',
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-reset-token',
      expiresAt: new Date('2026-03-21T18:30:00.000Z'),
      consumedAt: null,
      createdAt: new Date('2026-03-21T17:30:00.000Z'),
      updatedAt: new Date('2026-03-21T17:30:00.000Z'),
    };
    const create = jest.fn().mockResolvedValue(storedToken);
    const repository = new PasswordResetTokensRepository(
      createPrismaServiceMock({ create }),
    );
    const input: CreatePasswordResetTokenInput = {
      adminUserId: 'admin_user_1',
      tokenHash: 'hashed-reset-token',
      expiresAt: new Date('2026-03-21T18:30:00.000Z'),
    };

    await expect(repository.create(input)).resolves.toEqual(storedToken);
    expect(create).toHaveBeenCalledWith({
      data: {
        adminUserId: 'admin_user_1',
        tokenHash: 'hashed-reset-token',
        expiresAt: new Date('2026-03-21T18:30:00.000Z'),
      },
    });
  });
});

function createPrismaServiceMock(overrides: { create?: jest.Mock }) {
  return {
    passwordResetToken: {
      create: overrides.create ?? jest.fn(),
    },
  } as unknown as ConstructorParameters<
    typeof PasswordResetTokensRepository
  >[0];
}
