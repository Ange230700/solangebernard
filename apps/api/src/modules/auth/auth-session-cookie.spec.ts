import {
  clearAuthSessionCookie,
  createAuthSessionCookie,
  readAuthSessionCookie,
} from './auth-session-cookie';

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

  it('reads the auth session token back out of a cookie header', () => {
    expect(
      readAuthSessionCookie(
        'theme=light; solange_admin_session=session-token-123; Path=/; HttpOnly',
      ),
    ).toBe('session-token-123');
  });

  it('creates a clearing cookie that immediately expires the session', () => {
    const reply = {
      header: jest.fn(),
    };

    clearAuthSessionCookie(reply, { appEnv: 'local' });

    expect(reply.header).toHaveBeenCalledWith(
      'Set-Cookie',
      'solange_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
  });
});
