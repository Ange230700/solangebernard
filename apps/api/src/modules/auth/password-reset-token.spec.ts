import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from './password-reset-token';

describe('password-reset-token', () => {
  it('creates a raw token and a hashed persisted token value', () => {
    const createdToken = createPasswordResetToken('local-dev-auth-secret-123');

    expect(createdToken.token).toMatch(/^[a-f0-9]{64}$/);
    expect(createdToken.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(createdToken.tokenHash).toBe(
      hashPasswordResetToken(createdToken.token, 'local-dev-auth-secret-123'),
    );
  });

  it('hashes the same token deterministically for persistence lookups', () => {
    expect(
      hashPasswordResetToken(
        'raw-password-reset-token',
        'local-dev-auth-secret-123',
      ),
    ).toBe(
      hashPasswordResetToken(
        'raw-password-reset-token',
        'local-dev-auth-secret-123',
      ),
    );
  });
});
