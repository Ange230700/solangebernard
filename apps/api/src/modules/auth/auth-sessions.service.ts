import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../../config/api-config.service';
import { AUTH_SESSION_DURATION_MS } from './auth-session.constants';
import {
  createAuthSessionToken,
  hashAuthSessionToken,
} from './auth-session-token';
import { AuthSessionsRepository } from './auth-sessions.repository';
import type {
  AuthenticatedAdminSession,
  CreatedAuthSession,
} from './auth-sessions.types';

@Injectable()
export class AuthSessionsService {
  constructor(
    private readonly authSessionsRepository: AuthSessionsRepository,
    private readonly apiConfig: ApiConfigService,
  ) {}

  async create(adminUserId: string): Promise<CreatedAuthSession> {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + AUTH_SESSION_DURATION_MS);
    const sessionToken = createAuthSessionToken(this.apiConfig.authSecret);

    await this.authSessionsRepository.create({
      adminUserId,
      tokenHash: sessionToken.tokenHash,
      expiresAt,
    });

    return {
      token: sessionToken.token,
      issuedAt,
      expiresAt,
    };
  }

  async findAuthenticatedSession(
    token: string,
  ): Promise<AuthenticatedAdminSession | null> {
    const tokenHash = hashAuthSessionToken(token, this.apiConfig.authSecret);
    const authenticatedSession =
      await this.authSessionsRepository.findActiveByTokenHash(
        tokenHash,
        new Date(),
      );

    if (!authenticatedSession || !authenticatedSession.user.isActive) {
      return null;
    }

    return authenticatedSession;
  }
}
