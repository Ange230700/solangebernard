import {
  createAuthSessionToken,
  hashAuthSessionToken,
} from './auth-session-token';

describe('auth-session-token', () => {
  it('creates a raw token and matching hash', () => {
    const sessionToken = createAuthSessionToken('local-dev-auth-secret-123');

    expect(sessionToken.token).toMatch(/^[a-f0-9]{64}$/);
    expect(sessionToken.tokenHash).toHaveLength(64);
    expect(sessionToken.tokenHash).toBe(
      hashAuthSessionToken(sessionToken.token, 'local-dev-auth-secret-123'),
    );
  });

  it('hashes the same token deterministically', () => {
    expect(
      hashAuthSessionToken('session-token-123', 'local-dev-auth-secret-123'),
    ).toBe(
      hashAuthSessionToken('session-token-123', 'local-dev-auth-secret-123'),
    );
  });
});
