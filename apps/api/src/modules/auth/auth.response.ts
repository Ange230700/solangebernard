import type { CurrentUserResponse, LoginResponse } from '@repo/contracts';
import { mapResponse } from '../../common/responses/response-mapping';
import type { AuthenticatedAdminSession } from './auth-sessions.types';
import type { AuthenticatedSessionResult } from './auth.types';

const COOKIE_SESSION_TRANSPORT = 'cookie' as const;

export function mapLoginResponse(
  result: AuthenticatedSessionResult,
): LoginResponse {
  return mapAuthenticatedSessionResponse(result);
}

export function mapCurrentUserResponse(
  authenticatedSession: AuthenticatedAdminSession,
): CurrentUserResponse {
  return mapAuthenticatedSessionResponse({
    user: authenticatedSession.user,
    session: {
      issuedAt: authenticatedSession.session.createdAt,
      expiresAt: authenticatedSession.session.expiresAt,
    },
  });
}

function mapAuthenticatedSessionResponse(source: {
  user: AuthenticatedSessionResult['user'];
  session: { expiresAt: Date; issuedAt: Date };
}): CurrentUserResponse {
  return mapResponse(source, (sessionSource) => ({
    user: {
      id: sessionSource.user.id,
      email: sessionSource.user.email,
      role: sessionSource.user.role,
      isActive: sessionSource.user.isActive,
    },
    session: {
      transport: COOKIE_SESSION_TRANSPORT,
      issuedAt: sessionSource.session.issuedAt.toISOString(),
      expiresAt: sessionSource.session.expiresAt.toISOString(),
    },
  }));
}
