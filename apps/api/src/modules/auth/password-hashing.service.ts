import { Injectable } from '@nestjs/common';
import type { HashPasswordOptions } from './password-hashing';
import { hashPassword, verifyPassword } from './password-hashing';

@Injectable()
export class PasswordHashingService {
  hashPassword(
    password: string,
    options?: HashPasswordOptions,
  ): Promise<string> {
    return hashPassword(password, options);
  }

  verifyPassword(
    password: string,
    storedPasswordHash: string,
  ): Promise<boolean> {
    return verifyPassword(password, storedPasswordHash);
  }
}
