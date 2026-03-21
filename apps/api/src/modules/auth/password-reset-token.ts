import { createHmac, randomBytes } from 'node:crypto';

const PASSWORD_RESET_TOKEN_BYTES = 32;

export interface CreatedPasswordResetTokenValue {
  token: string;
  tokenHash: string;
}

export function createPasswordResetToken(
  authSecret: string,
): CreatedPasswordResetTokenValue {
  const token = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('hex');

  return {
    token,
    tokenHash: hashPasswordResetToken(token, authSecret),
  };
}

export function hashPasswordResetToken(
  token: string,
  authSecret: string,
): string {
  return createHmac('sha256', authSecret).update(token).digest('hex');
}
