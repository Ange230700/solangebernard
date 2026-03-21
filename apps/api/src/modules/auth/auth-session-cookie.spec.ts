import { createAuthSessionCookie } from './auth-session-cookie';

describe('createAuthSessionCookie', () => {
  it('creates a local development cookie without the secure flag', () => {
    expect(
      createAuthSessionCookie({
        appEnv: 'local',
        token: 'session-token-123',
      }),
    ).toBe(
      'solange_admin_session=session-token-123; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200',
    );
  });

  it('adds the secure flag outside local development', () => {
    expect(
      createAuthSessionCookie({
        appEnv: 'production',
        token: 'session-token-123',
      }),
    ).toContain('Secure');
  });
});
