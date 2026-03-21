import type { LoginResponse } from '@repo/contracts';
import { mapResponse } from '../../common/responses/response-mapping';
import type { AuthenticatedSessionResult } from './auth.types';

const COOKIE_SESSION_TRANSPORT = 'cookie' as const;

export function mapLoginResponse(
  result: AuthenticatedSessionResult,
): LoginResponse {
  return mapResponse(result, (source) => ({
    user: {
      id: source.user.id,
      email: source.user.email,
      role: source.user.role,
      isActive: source.user.isActive,
    },
    session: {
      transport: COOKIE_SESSION_TRANSPORT,
      issuedAt: source.session.issuedAt.toISOString(),
      expiresAt: source.session.expiresAt.toISOString(),
    },
  }));
}
