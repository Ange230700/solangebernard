import { Inject, Injectable } from '@nestjs/common';
import type { PasswordResetToken as PrismaPasswordResetToken } from '../../../generated/prisma/client';
import { PRISMA_CLIENT } from '../../persistence/prisma.constants';
import type { PrismaService } from '../../persistence/prisma.service';
import type {
  CreatePasswordResetTokenInput,
  StoredPasswordResetToken,
} from './password-reset-tokens.types';

type PasswordResetTokensPersistenceClient = Pick<
  PrismaService,
  'passwordResetToken'
>;

@Injectable()
export class PasswordResetTokensRepository {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly prisma: PasswordResetTokensPersistenceClient,
  ) {}

  async create(
    input: CreatePasswordResetTokenInput,
  ): Promise<StoredPasswordResetToken> {
    const passwordResetToken = await this.prisma.passwordResetToken.create({
      data: {
        adminUserId: input.adminUserId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });

    return mapStoredPasswordResetToken(passwordResetToken);
  }
}

function mapStoredPasswordResetToken(
  passwordResetToken: PrismaPasswordResetToken,
): StoredPasswordResetToken {
  return {
    id: passwordResetToken.id,
    adminUserId: passwordResetToken.adminUserId,
    tokenHash: passwordResetToken.tokenHash,
    expiresAt: passwordResetToken.expiresAt,
    consumedAt: passwordResetToken.consumedAt,
    createdAt: passwordResetToken.createdAt,
    updatedAt: passwordResetToken.updatedAt,
  };
}
