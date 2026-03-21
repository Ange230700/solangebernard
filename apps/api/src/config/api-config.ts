export const API_CONFIG = Symbol('API_CONFIG');

export const APP_ENVIRONMENTS = ['local', 'staging', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export interface NotificationProviderConfig {
  apiKey?: string;
  name: string;
  sender?: string;
}

export interface ApiConfig {
  appEnv: AppEnvironment;
  authSecret: string;
  databaseUrl: string;
  frontendOrigins: string[];
  notificationProvider: NotificationProviderConfig;
  port: number;
}

export function createApiConfig(env: NodeJS.ProcessEnv): ApiConfig {
  const errors: string[] = [];

  const appEnv = parseAppEnvironment(env.APP_ENV, errors);
  const authSecret = parseAuthSecret(env.AUTH_SECRET, errors);
  const databaseUrl = parseRequiredString(
    'DATABASE_URL',
    env.DATABASE_URL,
    errors,
  );
  const frontendOrigins = parseFrontendOrigins(env.FRONTEND_ORIGINS, errors);
  const notificationProviderName = parseRequiredString(
    'NOTIFICATION_PROVIDER',
    env.NOTIFICATION_PROVIDER,
    errors,
  );
  const notificationProviderApiKey = normalizeOptionalString(
    env.NOTIFICATION_PROVIDER_API_KEY,
  );
  const notificationProviderSender = normalizeOptionalString(
    env.NOTIFICATION_PROVIDER_SENDER,
  );
  const port = parsePort(env.PORT, errors);

  if (errors.length > 0) {
    throw new Error(
      `Invalid API configuration:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
  }

  return {
    appEnv,
    authSecret,
    databaseUrl,
    frontendOrigins,
    notificationProvider: {
      name: notificationProviderName,
      ...(notificationProviderApiKey
        ? { apiKey: notificationProviderApiKey }
        : {}),
      ...(notificationProviderSender
        ? { sender: notificationProviderSender }
        : {}),
    },
    port,
  };
}

function parseAppEnvironment(
  rawValue: string | undefined,
  errors: string[],
): AppEnvironment {
  if (rawValue && APP_ENVIRONMENTS.includes(rawValue as AppEnvironment)) {
    return rawValue as AppEnvironment;
  }

  errors.push(`APP_ENV must be one of: ${APP_ENVIRONMENTS.join(', ')}.`);

  return 'local';
}

function parseAuthSecret(
  rawValue: string | undefined,
  errors: string[],
): string {
  const value = normalizeOptionalString(rawValue);

  if (!value) {
    errors.push('AUTH_SECRET is required.');
    return '';
  }

  if (value.length < 16) {
    errors.push('AUTH_SECRET must be at least 16 characters long.');
  }

  return value;
}

function parseFrontendOrigins(
  rawValue: string | undefined,
  errors: string[],
): string[] {
  const value = normalizeOptionalString(rawValue);

  if (!value) {
    errors.push('FRONTEND_ORIGINS is required.');
    return [];
  }

  const origins = [
    ...new Set(
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  ];

  if (origins.length === 0) {
    errors.push('FRONTEND_ORIGINS must contain at least one origin.');
    return [];
  }

  origins.forEach((origin) => {
    try {
      new URL(origin);
    } catch {
      errors.push(`FRONTEND_ORIGINS contains an invalid URL: ${origin}.`);
    }
  });

  return origins;
}

function parsePort(rawValue: string | undefined, errors: string[]): number {
  if (!normalizeOptionalString(rawValue)) {
    return 3000;
  }

  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 1 ||
    parsedValue > 65535
  ) {
    errors.push('PORT must be an integer between 1 and 65535.');
    return 3000;
  }

  return parsedValue;
}

function parseRequiredString(
  name: string,
  rawValue: string | undefined,
  errors: string[],
): string {
  const value = normalizeOptionalString(rawValue);

  if (!value) {
    errors.push(`${name} is required.`);
    return '';
  }

  return value;
}

function normalizeOptionalString(
  value: string | undefined,
): string | undefined {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}
