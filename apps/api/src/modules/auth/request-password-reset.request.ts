import type { RequestPasswordResetRequest } from '@repo/contracts';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetRequestDto implements RequestPasswordResetRequest {
  @IsEmail()
  email!: string;
}
