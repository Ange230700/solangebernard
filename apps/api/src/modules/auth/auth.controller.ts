import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import type { LoginResponse } from '@repo/contracts';
import { ApiConfigService } from '../../config/api-config.service';
import {
  setAuthSessionCookie,
  type CookieHeaderReply,
} from './auth-session-cookie';
import { mapLoginResponse } from './auth.response';
import { LoginRequestDto } from './login.request';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly apiConfig: ApiConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() request: LoginRequestDto,
    @Res({ passthrough: true }) reply: CookieHeaderReply,
  ): Promise<LoginResponse> {
    const result = await this.authService.login(request);

    setAuthSessionCookie(reply, {
      appEnv: this.apiConfig.appEnv,
      token: result.session.token,
    });

    return mapLoginResponse(result);
  }
}
