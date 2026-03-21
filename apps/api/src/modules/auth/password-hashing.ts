import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const PASSWORD_HASH_ALGORITHM = 'scrypt';
const PASSWORD_HASH_KEY_LENGTH = 64;

export interface HashPasswordOptions {
  salt?: string;
}

export async function hashPassword(
  password: string,
  options: HashPasswordOptions = {},
): Promise<string> {
  const salt = options.salt ?? randomBytes(16).toString('hex');
  const derivedKey = await derivePasswordKey(password, salt);

  return `${PASSWORD_HASH_ALGORITHM}$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(
  password: string,
  storedPasswordHash: string,
): Promise<boolean> {
  const parsedHash = parsePasswordHash(storedPasswordHash);

  if (!parsedHash) {
    return false;
  }

  const derivedKey = await derivePasswordKey(password, parsedHash.salt);

  if (derivedKey.length !== parsedHash.hash.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, parsedHash.hash);
}

async function derivePasswordKey(
  password: string,
  salt: string,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, PASSWORD_HASH_KEY_LENGTH, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(Buffer.from(derivedKey));
    });
  });
}

function parsePasswordHash(
  storedPasswordHash: string,
): { hash: Buffer; salt: string } | null {
  const [algorithm, salt, hash] = storedPasswordHash.split('$');

  if (algorithm !== PASSWORD_HASH_ALGORITHM || !salt || !hash) {
    return null;
  }

  if (!isHexString(hash)) {
    return null;
  }

  return {
    salt,
    hash: Buffer.from(hash, 'hex'),
  };
}

function isHexString(value: string): boolean {
  return (
    value.length > 0 && value.length % 2 === 0 && /^[0-9a-f]+$/iu.test(value)
  );
}
