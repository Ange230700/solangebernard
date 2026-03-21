import type { LoginRequest } from '@repo/contracts';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
