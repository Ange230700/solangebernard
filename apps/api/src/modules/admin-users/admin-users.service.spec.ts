import { AdminUsersService } from './admin-users.service';
import type {
  CreateAdminUserInput,
  StoredAdminUser,
} from './admin-users.types';

describe('AdminUsersService', () => {
  const adminUser: StoredAdminUser = {
    id: 'admin_user_1',
    email: 'admin@solangebernard.com',
    passwordHash: 'hashed-password',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-03-21T16:00:00.000Z'),
    updatedAt: new Date('2026-03-21T16:00:00.000Z'),
  };

  it('delegates lookups by email to the repository', async () => {
    const repository = {
      create: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(adminUser),
      findById: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    const service = new AdminUsersService(
      repository as unknown as ConstructorParameters<
        typeof AdminUsersService
      >[0],
    );

    await expect(
      service.findByEmail('admin@solangebernard.com'),
    ).resolves.toEqual(adminUser);
    expect(repository.findByEmail).toHaveBeenCalledWith(
      'admin@solangebernard.com',
    );
  });

  it('delegates admin user creation to the repository', async () => {
    const repository = {
      create: jest.fn().mockResolvedValue(adminUser),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updatePasswordHash: jest.fn(),
    };
    const service = new AdminUsersService(
      repository as unknown as ConstructorParameters<
        typeof AdminUsersService
      >[0],
    );
    const input: CreateAdminUserInput = {
      email: 'admin@solangebernard.com',
      passwordHash: 'hashed-password',
      role: 'admin',
    };

    await expect(service.create(input)).resolves.toEqual(adminUser);
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});
