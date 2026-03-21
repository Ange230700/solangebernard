import { Inject, Injectable } from '@nestjs/common';
import type {
  AdminSession as PrismaAdminSession,
  AdminUser as PrismaAdminUser,
} from '../../../generated/prisma/client';
import { PRISMA_CLIENT } from '../../persistence/prisma.constants';
import type { PrismaService } from '../../persistence/prisma.service';
import type {
  AuthenticatedAdminSession,
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

  async findActiveByTokenHash(
    tokenHash: string,
    at: Date,
  ): Promise<AuthenticatedAdminSession | null> {
    const adminSession = await this.prisma.adminSession.findFirst({
      where: {
        tokenHash,
        invalidatedAt: null,
        expiresAt: {
          gt: at,
        },
      },
      include: {
        adminUser: true,
      },
    });

    return adminSession ? mapAuthenticatedAdminSession(adminSession) : null;
  }

  async invalidateById(
    sessionId: string,
    invalidatedAt: Date,
  ): Promise<StoredAuthSession> {
    const adminSession = await this.prisma.adminSession.update({
      where: {
        id: sessionId,
      },
      data: {
        invalidatedAt,
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

function mapAuthenticatedAdminSession(
  adminSession: PrismaAdminSessionWithUser,
): AuthenticatedAdminSession {
  return {
    session: mapStoredAuthSession(adminSession),
    user: {
      id: adminSession.adminUser.id,
      email: adminSession.adminUser.email,
      passwordHash: adminSession.adminUser.passwordHash,
      role: adminSession.adminUser.role,
      isActive: adminSession.adminUser.isActive,
      createdAt: adminSession.adminUser.createdAt,
      updatedAt: adminSession.adminUser.updatedAt,
    },
  };
}

type PrismaAdminSessionWithUser = PrismaAdminSession & {
  adminUser: PrismaAdminUser;
};
