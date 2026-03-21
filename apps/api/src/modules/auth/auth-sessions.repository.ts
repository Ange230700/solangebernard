import { Inject, Injectable } from '@nestjs/common';
import type { AdminSession as PrismaAdminSession } from '../../../generated/prisma/client';
import { PRISMA_CLIENT } from '../../persistence/prisma.constants';
import type { PrismaService } from '../../persistence/prisma.service';
import type {
  CreateAuthSessionInput,
  StoredAuthSession,
} from './auth-sessions.types';

type AuthSessionsPersistenceClient = Pick<PrismaService, 'adminSession'>;

@Injectable()
export class AuthSessionsRepository {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly prisma: AuthSessionsPersistenceClient,
  ) {}

  async create(input: CreateAuthSessionInput): Promise<StoredAuthSession> {
    const adminSession = await this.prisma.adminSession.create({
      data: {
        adminUserId: input.adminUserId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });

    return mapStoredAuthSession(adminSession);
  }
}

function mapStoredAuthSession(
  adminSession: PrismaAdminSession,
): StoredAuthSession {
  return {
    id: adminSession.id,
    adminUserId: adminSession.adminUserId,
    tokenHash: adminSession.tokenHash,
    expiresAt: adminSession.expiresAt,
    invalidatedAt: adminSession.invalidatedAt,
    createdAt: adminSession.createdAt,
    updatedAt: adminSession.updatedAt,
  };
}
