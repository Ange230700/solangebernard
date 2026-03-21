import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoginRequest } from '@repo/contracts';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { AuthSessionsService } from './auth-sessions.service';
import { PasswordHashingService } from './password-hashing.service';
import type { AuthenticatedSessionResult } from './auth.types';

const ACCOUNT_DISABLED_CODE = 'AccountDisabled' as const;
const INVALID_CREDENTIALS_CODE = 'InvalidCredentials' as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly authSessionsService: AuthSessionsService,
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

    const session = await this.authSessionsService.create(user.id);

    return {
      user,
      session,
    };
  }
}

function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
