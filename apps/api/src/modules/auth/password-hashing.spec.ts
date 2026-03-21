import { hashPassword, verifyPassword } from './password-hashing';

describe('password hashing', () => {
  it('hashes passwords in the shared scrypt format', async () => {
    await expect(
      hashPassword('SecurePass123!', {
        salt: 'solangebernard-dev-seed:admin:v1',
      }),
    ).resolves.toBe(
      'scrypt$solangebernard-dev-seed:admin:v1$03ba97ac7179594c03875372a9d0f38f393b853752e1f1cfade3c3a281a41b91c4ba8d0a3e7b6715d31a0b8fc77c142e2eda21de421f96f0905f2a73a5d899ee',
    );
  });

  it('verifies the correct password against a stored hash', async () => {
    const passwordHash = await hashPassword('SecurePass123!', {
      salt: 'solangebernard-dev-seed:staff:v1',
    });

    await expect(verifyPassword('SecurePass123!', passwordHash)).resolves.toBe(
      true,
    );
    await expect(verifyPassword('WrongPass999!', passwordHash)).resolves.toBe(
      false,
    );
  });

  it('rejects malformed password hashes safely', async () => {
    await expect(
      verifyPassword('SecurePass123!', 'argon2$bad$hash'),
    ).resolves.toBe(false);
    await expect(
      verifyPassword('SecurePass123!', 'scrypt$missing'),
    ).resolves.toBe(false);
  });
});
