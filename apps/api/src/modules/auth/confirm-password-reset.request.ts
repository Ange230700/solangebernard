import type { ConfirmPasswordResetRequest } from '@repo/contracts';
import { IsString, MinLength } from 'class-validator';

export class ConfirmPasswordResetRequestDto implements ConfirmPasswordResetRequest {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(1)
  newPassword!: string;
}
