import type { AppEnvironment } from '../../config/api-config';
import {
  AUTH_SESSION_COOKIE_NAME,
  AUTH_SESSION_DURATION_SECONDS,
} from './auth-session.constants';

export interface AuthSessionCookieOptions {
  appEnv: AppEnvironment;
  token: string;
}

export interface CookieHeaderReply {
  header(name: string, value: string): unknown;
}

export function setAuthSessionCookie(
  reply: CookieHeaderReply,
  options: AuthSessionCookieOptions,
): void {
  reply.header('Set-Cookie', createAuthSessionCookie(options));
}

export function readAuthSessionCookie(
  cookieHeader: string | string[] | undefined,
): string | undefined {
  const cookieValue = Array.isArray(cookieHeader)
    ? cookieHeader.join('; ')
    : cookieHeader;

  if (!cookieValue) {
    return undefined;
  }

  return cookieValue
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_SESSION_COOKIE_NAME}=`))
    ?.slice(`${AUTH_SESSION_COOKIE_NAME}=`.length);
}

export function createAuthSessionCookie(
  options: AuthSessionCookieOptions,
): string {
  const attributes = [
    `${AUTH_SESSION_COOKIE_NAME}=${options.token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${AUTH_SESSION_DURATION_SECONDS}`,
  ];

  if (options.appEnv !== 'local') {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}
