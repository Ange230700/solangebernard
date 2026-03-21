import { Inject, Injectable } from '@nestjs/common';
import type { AdminUser as PrismaAdminUser } from '../../../generated/prisma/client';
import { PRISMA_CLIENT } from '../../persistence/prisma.constants';
import type { PrismaService } from '../../persistence/prisma.service';
import type {
  CreateAdminUserInput,
  StoredAdminUser,
} from './admin-users.types';

type AdminUsersPersistenceClient = Pick<PrismaService, 'adminUser'>;

@Injectable()
export class AdminUsersRepository {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly prisma: AdminUsersPersistenceClient,
  ) {}

  async findByEmail(email: string): Promise<StoredAdminUser | null> {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    return adminUser ? mapStoredAdminUser(adminUser) : null;
  }

  async findById(id: string): Promise<StoredAdminUser | null> {
    const adminUser = await this.prisma.adminUser.findUnique({
      where: { id },
    });

    return adminUser ? mapStoredAdminUser(adminUser) : null;
  }

  async create(input: CreateAdminUserInput): Promise<StoredAdminUser> {
    const adminUser = await this.prisma.adminUser.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        isActive: input.isActive ?? true,
      },
    });

    return mapStoredAdminUser(adminUser);
  }

  async updatePasswordHash(
    adminUserId: string,
    passwordHash: string,
  ): Promise<StoredAdminUser> {
    const adminUser = await this.prisma.adminUser.update({
      where: { id: adminUserId },
      data: { passwordHash },
    });

    return mapStoredAdminUser(adminUser);
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
