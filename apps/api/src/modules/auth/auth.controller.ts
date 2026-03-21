import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type {
  CurrentUserResponse,
  LoginResponse,
  LogoutResponse,
} from '@repo/contracts';
import { ApiConfigService } from '../../config/api-config.service';
import {
  clearAuthSessionCookie,
  setAuthSessionCookie,
  type CookieHeaderReply,
} from './auth-session-cookie';
import { AuthGuard } from './auth.guard';
import type { AuthenticatedAdminRequest } from './auth-request.types';
import { mapCurrentUserResponse, mapLoginResponse } from './auth.response';
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

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: AuthenticatedAdminRequest,
    @Res({ passthrough: true }) reply: CookieHeaderReply,
  ): Promise<LogoutResponse> {
    const authenticatedSession = request.authenticatedAdminSession;

    if (!authenticatedSession) {
      throw new Error('Authenticated session was missing after auth guard.');
    }

    await this.authService.logout(authenticatedSession.session.id);
    clearAuthSessionCookie(reply, {
      appEnv: this.apiConfig.appEnv,
    });

    return {
      success: true,
    };
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  currentUser(@Req() request: AuthenticatedAdminRequest): CurrentUserResponse {
    const authenticatedSession = request.authenticatedAdminSession;

    if (!authenticatedSession) {
      throw new Error('Authenticated session was missing after auth guard.');
    }

    return mapCurrentUserResponse(authenticatedSession);
  }
}
