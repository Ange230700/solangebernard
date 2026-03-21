import { Injectable } from '@nestjs/common';
import type { AdminUser as PrismaAdminUser } from '../../../generated/prisma/client';
import { ApiConfigService } from '../../config/api-config.service';
import { PrismaService } from '../../persistence/prisma.service';
import type { StoredAdminUser } from '../admin-users/admin-users.types';
import { PASSWORD_RESET_TOKEN_DURATION_MS } from './password-reset-token.constants';
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from './password-reset-token';
import { PasswordResetTokensRepository } from './password-reset-tokens.repository';
import type { CreatedPasswordResetToken } from './password-reset-tokens.types';

@Injectable()
export class PasswordResetTokensService {
  constructor(
    private readonly passwordResetTokensRepository: PasswordResetTokensRepository,
    private readonly apiConfig: ApiConfigService,
    private readonly prisma: PrismaService,
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

  async consumeAndUpdatePassword(
    token: string,
    passwordHash: string,
  ): Promise<StoredAdminUser | null> {
    const at = new Date();
    const tokenHash = hashPasswordResetToken(token, this.apiConfig.authSecret);

    return this.prisma.$transaction(async (transaction) => {
      const passwordResetToken = await transaction.passwordResetToken.findFirst(
        {
          where: {
            tokenHash,
            consumedAt: null,
            expiresAt: {
              gt: at,
            },
          },
        },
      );

      if (!passwordResetToken) {
        return null;
      }

      const consumedTokenCount =
        await transaction.passwordResetToken.updateMany({
          where: {
            id: passwordResetToken.id,
            consumedAt: null,
            expiresAt: {
              gt: at,
            },
          },
          data: {
            consumedAt: at,
          },
        });

      if (consumedTokenCount.count !== 1) {
        return null;
      }

      const adminUser = await transaction.adminUser.update({
        where: {
          id: passwordResetToken.adminUserId,
        },
        data: {
          passwordHash,
        },
      });

      return mapStoredAdminUser(adminUser);
    });
  }
}

function mapStoredAdminUser(adminUser: PrismaAdminUser): StoredAdminUser {
  return {
    id: adminUser.id,
    email: adminUser.email,
    passwordHash: adminUser.passwordHash,
    role: adminUser.role,
    isActive: adminUser.isActive,
    createdAt: adminUser.createdAt,
    updatedAt: adminUser.updatedAt,
  };
}
