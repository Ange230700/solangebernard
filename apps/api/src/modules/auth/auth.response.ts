import type {
  ConfirmPasswordResetResponse,
  CurrentUserResponse,
  LoginResponse,
} from '@repo/contracts';
import { mapResponse } from '../../common/responses/response-mapping';
import type { StoredAdminUser } from '../admin-users/admin-users.types';
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

export function mapConfirmPasswordResetResponse(
  user: StoredAdminUser,
): ConfirmPasswordResetResponse {
  return mapResponse(user, (adminUser) => ({
    user: mapAuthenticatedAdminUser(adminUser),
  }));
}

function mapAuthenticatedSessionResponse(source: {
  user: AuthenticatedSessionResult['user'];
  session: { expiresAt: Date; issuedAt: Date };
}): CurrentUserResponse {
  return mapResponse(source, (sessionSource) => ({
    user: mapAuthenticatedAdminUser(sessionSource.user),
    session: {
      transport: COOKIE_SESSION_TRANSPORT,
      issuedAt: sessionSource.session.issuedAt.toISOString(),
      expiresAt: sessionSource.session.expiresAt.toISOString(),
    },
  }));
}

function mapAuthenticatedAdminUser(user: StoredAdminUser) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
