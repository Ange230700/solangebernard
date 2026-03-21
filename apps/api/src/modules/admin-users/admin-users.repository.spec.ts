import { AdminUsersRepository } from './admin-users.repository';
import type {
  CreateAdminUserInput,
  StoredAdminUser,
} from './admin-users.types';

describe('AdminUsersRepository', () => {
  const adminUser: StoredAdminUser = {
    id: 'admin_user_1',
    email: 'admin@solangebernard.com',
    passwordHash: 'hashed-password',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2026-03-21T16:00:00.000Z'),
    updatedAt: new Date('2026-03-21T16:00:00.000Z'),
  };

  it('finds an admin user by email', async () => {
    const findUnique = jest.fn().mockResolvedValue(adminUser);
    const prisma = createPrismaServiceMock({
      findUnique,
    });
    const repository = new AdminUsersRepository(prisma);

    await expect(
      repository.findByEmail('admin@solangebernard.com'),
    ).resolves.toEqual(adminUser);
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@solangebernard.com' },
    });
  });

  it('creates admin users with an active default', async () => {
    const create = jest.fn().mockResolvedValue(adminUser);
    const prisma = createPrismaServiceMock({
      create,
    });
    const repository = new AdminUsersRepository(prisma);
    const input: CreateAdminUserInput = {
      email: 'admin@solangebernard.com',
      passwordHash: 'hashed-password',
      role: 'admin',
    };

    await expect(repository.create(input)).resolves.toEqual(adminUser);
    expect(create).toHaveBeenCalledWith({
      data: {
        email: 'admin@solangebernard.com',
        passwordHash: 'hashed-password',
        role: 'admin',
        isActive: true,
      },
    });
  });

  it('updates the password hash for an existing admin user', async () => {
    const update = jest.fn().mockResolvedValue({
      ...adminUser,
      passwordHash: 'next-hash',
    });
    const prisma = createPrismaServiceMock({
      update,
    });
    const repository = new AdminUsersRepository(prisma);

    await expect(
      repository.updatePasswordHash('admin_user_1', 'next-hash'),
    ).resolves.toEqual({
      ...adminUser,
      passwordHash: 'next-hash',
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'admin_user_1' },
      data: { passwordHash: 'next-hash' },
    });
  });
});

function createPrismaServiceMock(overrides: {
  create?: jest.Mock;
  findUnique?: jest.Mock;
  update?: jest.Mock;
}) {
  return {
    adminUser: {
      create: overrides.create ?? jest.fn(),
      findUnique: overrides.findUnique ?? jest.fn(),
      update: overrides.update ?? jest.fn(),
    },
  } as unknown as ConstructorParameters<typeof AdminUsersRepository>[0];
}
