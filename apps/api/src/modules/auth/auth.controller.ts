import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import type { LoginResponse } from '@repo/contracts';
import { mapLoginResponse } from './auth.response';
import { LoginRequestDto } from './login.request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequestDto): Promise<LoginResponse> {
    return mapLoginResponse(await this.authService.login(request));
  }
}
