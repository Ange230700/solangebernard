import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoginRequest } from '@repo/contracts';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { PasswordHashingService } from './password-hashing.service';
import type { AuthenticatedSessionResult } from './auth.types';

const ACCOUNT_DISABLED_CODE = 'AccountDisabled' as const;
const AUTH_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const INVALID_CREDENTIALS_CODE = 'InvalidCredentials' as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async login(request: LoginRequest): Promise<AuthenticatedSessionResult> {
    const email = normalizeEmailAddress(request.email);
    const user = await this.adminUsersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        code: INVALID_CREDENTIALS_CODE,
        message: 'Invalid credentials',
      });
    }

    if (!user.isActive) {
      throw new ForbiddenException({
        code: ACCOUNT_DISABLED_CODE,
        message: 'Account disabled',
      });
    }

    const isPasswordValid = await this.passwordHashingService.verifyPassword(
      request.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: INVALID_CREDENTIALS_CODE,
        message: 'Invalid credentials',
      });
    }

    const issuedAt = new Date();

    return {
      user,
      session: {
        issuedAt,
        expiresAt: new Date(issuedAt.getTime() + AUTH_SESSION_DURATION_MS),
      },
    };
  }
}

function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
