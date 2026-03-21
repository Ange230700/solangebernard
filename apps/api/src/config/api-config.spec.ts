import { createApiConfig } from './api-config';

describe('createApiConfig', () => {
  const validEnvironment: NodeJS.ProcessEnv = {
    APP_ENV: 'local',
    AUTH_SECRET: 'local-dev-auth-secret-123',
    DATABASE_URL:
      'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
    WEB_CLIENT_ORIGINS: 'http://127.0.0.1:4200,http://localhost:4200',
    DESKTOP_CLIENT_ORIGINS:
      'http://127.0.0.1:4201,tauri://localhost,http://localhost:4201',
    MOBILE_CLIENT_ORIGINS:
      'http://127.0.0.1:4202,capacitor://localhost,http://localhost',
    NOTIFICATION_PROVIDER: 'noop',
    NOTIFICATION_PROVIDER_API_KEY: '',
    NOTIFICATION_PROVIDER_SENDER: 'Solange Bernard',
    PORT: '3000',
  };

  it('parses a valid environment shape', () => {
    expect(createApiConfig(validEnvironment)).toEqual({
      appEnv: 'local',
      authSecret: 'local-dev-auth-secret-123',
      cors: {
        allowCredentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        allowedMethods: [
          'GET',
          'HEAD',
          'POST',
          'PUT',
          'PATCH',
          'DELETE',
          'OPTIONS',
        ],
        allowedOrigins: [
          'http://127.0.0.1:4200',
          'http://localhost:4200',
          'http://127.0.0.1:4201',
          'tauri://localhost',
          'http://localhost:4201',
          'http://127.0.0.1:4202',
          'capacitor://localhost',
          'http://localhost',
        ],
        desktopOrigins: [
          'http://127.0.0.1:4201',
          'tauri://localhost',
          'http://localhost:4201',
        ],
        mobileOrigins: [
          'http://127.0.0.1:4202',
          'capacitor://localhost',
          'http://localhost',
        ],
        webOrigins: ['http://127.0.0.1:4200', 'http://localhost:4200'],
      },
      databaseUrl:
        'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
      notificationProvider: {
        name: 'noop',
        sender: 'Solange Bernard',
      },
      port: 3000,
    });
  });

  it('throws when required environment variables are missing', () => {
    expect(() =>
      createApiConfig({
        ...validEnvironment,
        AUTH_SECRET: '',
        WEB_CLIENT_ORIGINS: '',
      }),
    ).toThrow(
      [
        'Invalid API configuration:',
        '- AUTH_SECRET is required.',
        '- WEB_CLIENT_ORIGINS is required.',
      ].join('\n'),
    );
  });

  it('falls back to FRONTEND_ORIGINS for older local env files', () => {
    expect(
      createApiConfig({
        ...validEnvironment,
        DESKTOP_CLIENT_ORIGINS: undefined,
        FRONTEND_ORIGINS:
          'http://127.0.0.1:4200,http://127.0.0.1:4201,tauri://localhost',
        MOBILE_CLIENT_ORIGINS: undefined,
        WEB_CLIENT_ORIGINS: undefined,
      }).cors,
    ).toEqual({
      allowCredentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      allowedMethods: [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],
      allowedOrigins: [
        'http://127.0.0.1:4200',
        'http://127.0.0.1:4201',
        'tauri://localhost',
      ],
      desktopOrigins: [],
      mobileOrigins: [],
      webOrigins: [],
    });
  });

  it('throws when values are invalid', () => {
    expect(() =>
      createApiConfig({
        ...validEnvironment,
        APP_ENV: 'preview',
        AUTH_SECRET: 'short-secret',
        MOBILE_CLIENT_ORIGINS: 'not-a-url',
        PORT: '70000',
      }),
    ).toThrow(
      [
        'Invalid API configuration:',
        '- APP_ENV must be one of: local, staging, production.',
        '- AUTH_SECRET must be at least 16 characters long.',
        '- MOBILE_CLIENT_ORIGINS contains an invalid URL: not-a-url.',
        '- PORT must be an integer between 1 and 65535.',
      ].join('\n'),
    );
  });
});
