import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  ConfirmPasswordResetRequest,
  LoginRequest,
  RequestPasswordResetRequest,
} from '@repo/contracts';
import type { StoredAdminUser } from '../admin-users/admin-users.types';
import { AdminUsersService } from '../admin-users/admin-users.service';
import { AuthSessionsService } from './auth-sessions.service';
import { PasswordHashingService } from './password-hashing.service';
import { isStrongPassword } from './password-policy';
import { PasswordResetTokensService } from './password-reset-tokens.service';
import type { AuthenticatedSessionResult } from './auth.types';

const ACCOUNT_DISABLED_CODE = 'AccountDisabled' as const;
const INVALID_CREDENTIALS_CODE = 'InvalidCredentials' as const;
const INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_CODE =
  'InvalidOrExpiredPasswordResetToken' as const;
const WEAK_PASSWORD_CODE = 'WeakPassword' as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUsersService: AdminUsersService,
    private readonly passwordHashingService: PasswordHashingService,
    private readonly authSessionsService: AuthSessionsService,
    private readonly passwordResetTokensService: PasswordResetTokensService,
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

  async logout(sessionId: string): Promise<void> {
    await this.authSessionsService.invalidateById(sessionId);
  }

  async requestPasswordReset(
    request: RequestPasswordResetRequest,
  ): Promise<void> {
    const email = normalizeEmailAddress(request.email);
    const user = await this.adminUsersService.findByEmail(email);

    if (!user || !user.isActive) {
      return;
    }

    await this.passwordResetTokensService.create(user.id);
  }

  async confirmPasswordReset(
    request: ConfirmPasswordResetRequest,
  ): Promise<StoredAdminUser> {
    if (!isStrongPassword(request.newPassword)) {
      throw new BadRequestException({
        code: WEAK_PASSWORD_CODE,
        message: 'Password does not meet strength requirements',
      });
    }

    const passwordHash = await this.passwordHashingService.hashPassword(
      request.newPassword,
    );
    const updatedUser =
      await this.passwordResetTokensService.consumeAndUpdatePassword(
        request.token,
        passwordHash,
      );

    if (!updatedUser) {
      throw new BadRequestException({
        code: INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_CODE,
        message: 'Invalid or expired password reset token',
      });
    }

    return updatedUser;
  }
}

function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}
