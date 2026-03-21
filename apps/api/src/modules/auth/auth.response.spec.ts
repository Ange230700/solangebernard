import { mapLoginResponse } from './auth.response';

describe('mapLoginResponse', () => {
  it('maps the authenticated session result to the public login contract', () => {
    expect(
      mapLoginResponse({
        user: {
          id: 'admin_user_1',
          email: 'admin@solangebernard.com',
          passwordHash: 'stored-hash',
          role: 'admin',
          isActive: true,
          createdAt: new Date('2026-03-21T16:00:00.000Z'),
          updatedAt: new Date('2026-03-21T16:00:00.000Z'),
        },
        session: {
          token: 'raw-session-token',
          issuedAt: new Date('2026-03-21T17:30:00.000Z'),
          expiresAt: new Date('2026-03-22T05:30:00.000Z'),
        },
      }),
    ).toEqual({
      user: {
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        role: 'admin',
        isActive: true,
      },
      session: {
        transport: 'cookie',
        issuedAt: '2026-03-21T17:30:00.000Z',
        expiresAt: '2026-03-22T05:30:00.000Z',
      },
    });
  });
});
