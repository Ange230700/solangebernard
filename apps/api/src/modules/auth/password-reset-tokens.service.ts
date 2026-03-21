import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../../config/api-config.service';
import { PASSWORD_RESET_TOKEN_DURATION_MS } from './password-reset-token.constants';
import { createPasswordResetToken } from './password-reset-token';
import { PasswordResetTokensRepository } from './password-reset-tokens.repository';
import type { CreatedPasswordResetToken } from './password-reset-tokens.types';

@Injectable()
export class PasswordResetTokensService {
  constructor(
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly apiConfig: ApiConfigService,
  ) {}

  async create(adminUserId: string): Promise<CreatedPasswordResetToken> {
    const issuedAt = new Date();
    const expiresAt = new Date(
      issuedAt.getTime() + PASSWORD_RESET_TOKEN_DURATION_MS,
    );
    const passwordResetToken = createPasswordResetToken(
      this.apiConfig.authSecret,
    );

    await this.passwordResetTokensRepository.create({
      adminUserId,
      tokenHash: passwordResetToken.tokenHash,
      expiresAt,
    });

    return {
      token: passwordResetToken.token,
      issuedAt,
      expiresAt,
    };
  }
}
