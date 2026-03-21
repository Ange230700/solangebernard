import { createHmac, randomBytes } from 'node:crypto';

const AUTH_SESSION_TOKEN_BYTES = 32;

export interface CreatedAuthSessionToken {
  token: string;
  tokenHash: string;
}

export function createAuthSessionToken(
  authSecret: string,
): CreatedAuthSessionToken {
  const token = randomBytes(AUTH_SESSION_TOKEN_BYTES).toString('hex');

  return {
    token,
    tokenHash: hashAuthSessionToken(token, authSecret),
  };
}

export function hashAuthSessionToken(
  token: string,
  authSecret: string,
): string {
  return createHmac('sha256', authSecret).update(token).digest('hex');
}
