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

export function clearAuthSessionCookie(
  reply: CookieHeaderReply,
  options: Pick<AuthSessionCookieOptions, 'appEnv'>,
): void {
  reply.header('Set-Cookie', createClearedAuthSessionCookie(options));
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
  return createSessionCookieAttributes({
    appEnv: options.appEnv,
    nameValue: `${AUTH_SESSION_COOKIE_NAME}=${options.token}`,
    maxAge: AUTH_SESSION_DURATION_SECONDS,
  });
}

function createClearedAuthSessionCookie(
  options: Pick<AuthSessionCookieOptions, 'appEnv'>,
): string {
  return createSessionCookieAttributes({
    appEnv: options.appEnv,
    expires: 'Thu, 01 Jan 1970 00:00:00 GMT',
    maxAge: 0,
    nameValue: `${AUTH_SESSION_COOKIE_NAME}=`,
  });
}

function createSessionCookieAttributes(options: {
  appEnv: AppEnvironment;
  expires?: string;
  maxAge: number;
  nameValue: string;
}): string {
  const attributes = [
    options.nameValue,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${options.maxAge}`,
  ];

  if (options.expires) {
    attributes.push(`Expires=${options.expires}`);
  }

  if (options.appEnv !== 'local') {
    attributes.push('Secure');
  }

  return attributes.join('; ');
}
