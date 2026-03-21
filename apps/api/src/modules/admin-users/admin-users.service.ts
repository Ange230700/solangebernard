import { Injectable } from '@nestjs/common';
import { AdminUsersRepository } from './admin-users.repository';
import type {
  CreateAdminUserInput,
  StoredAdminUser,
} from './admin-users.types';

@Injectable()
export class AdminUsersService {
  constructor(private readonly adminUsersRepository: AdminUsersRepository) {}

  create(input: CreateAdminUserInput): Promise<StoredAdminUser> {
    return this.adminUsersRepository.create(input);
  }

  findByEmail(email: string): Promise<StoredAdminUser | null> {
    return this.adminUsersRepository.findByEmail(email);
  }

  findById(id: string): Promise<StoredAdminUser | null> {
    return this.adminUsersRepository.findById(id);
  }

  updatePasswordHash(
    adminUserId: string,
    passwordHash: string,
  ): Promise<StoredAdminUser> {
    return this.adminUsersRepository.updatePasswordHash(
      adminUserId,
      passwordHash,
    );
  }
}
