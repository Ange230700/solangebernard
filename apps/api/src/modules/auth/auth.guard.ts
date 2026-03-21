import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { readAuthSessionCookie } from './auth-session-cookie';
import type { AuthenticatedAdminRequest } from './auth-request.types';
import { AuthSessionsService } from './auth-sessions.service';

const UNAUTHORIZED_CODE = 'Unauthorized' as const;

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authSessionsService: AuthSessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();
    const sessionToken = readAuthSessionCookie(request.headers.cookie);

    if (!sessionToken) {
      throw createUnauthorizedException();
    }

    const authenticatedSession =
      await this.authSessionsService.findAuthenticatedSession(sessionToken);

    if (!authenticatedSession) {
      throw createUnauthorizedException();
    }

    request.authenticatedAdminSession = authenticatedSession;
    request.authenticatedAdminUser = authenticatedSession.user;

    return true;
  }
}

function createUnauthorizedException(): UnauthorizedException {
  return new UnauthorizedException({
    code: UNAUTHORIZED_CODE,
    message: 'Authentication required',
  });
}
