import {
  mapConfirmPasswordResetResponse,
  mapCurrentUserResponse,
  mapLoginResponse,
} from './auth.response';

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

describe('mapCurrentUserResponse', () => {
  it('maps the authenticated request session to the public current-user contract', () => {
    expect(
      mapCurrentUserResponse({
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
          id: 'session_1',
          adminUserId: 'admin_user_1',
          tokenHash: 'hashed-session-token',
          expiresAt: new Date('2026-03-22T05:30:00.000Z'),
          invalidatedAt: null,
          createdAt: new Date('2026-03-21T17:30:00.000Z'),
          updatedAt: new Date('2026-03-21T17:30:00.000Z'),
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

describe('mapConfirmPasswordResetResponse', () => {
  it('maps the updated admin user to the public password-reset-confirm contract', () => {
    expect(
      mapConfirmPasswordResetResponse({
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        passwordHash: 'next-stored-hash',
        role: 'admin',
        isActive: true,
        createdAt: new Date('2026-03-21T16:00:00.000Z'),
        updatedAt: new Date('2026-03-21T18:30:00.000Z'),
      }),
    ).toEqual({
      user: {
        id: 'admin_user_1',
        email: 'admin@solangebernard.com',
        role: 'admin',
        isActive: true,
      },
    });
  });
});
