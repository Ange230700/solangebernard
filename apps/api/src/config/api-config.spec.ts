import { createApiConfig } from './api-config';

describe('createApiConfig', () => {
  const validEnvironment: NodeJS.ProcessEnv = {
    APP_ENV: 'local',
    AUTH_SECRET: 'local-dev-auth-secret-123',
    DATABASE_URL:
      'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
    FRONTEND_ORIGINS:
      'http://127.0.0.1:4200,http://127.0.0.1:4201,tauri://localhost',
    NOTIFICATION_PROVIDER: 'noop',
    NOTIFICATION_PROVIDER_API_KEY: '',
    NOTIFICATION_PROVIDER_SENDER: 'Solange Bernard',
    PORT: '3000',
  };

  it('parses a valid environment shape', () => {
    expect(createApiConfig(validEnvironment)).toEqual({
      appEnv: 'local',
      authSecret: 'local-dev-auth-secret-123',
      databaseUrl:
        'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
      frontendOrigins: [
        'http://127.0.0.1:4200',
        'http://127.0.0.1:4201',
        'tauri://localhost',
      ],
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
        FRONTEND_ORIGINS: '',
      }),
    ).toThrow(
      [
        'Invalid API configuration:',
        '- AUTH_SECRET is required.',
        '- FRONTEND_ORIGINS is required.',
      ].join('\n'),
    );
  });

  it('throws when values are invalid', () => {
    expect(() =>
      createApiConfig({
        ...validEnvironment,
        APP_ENV: 'preview',
        AUTH_SECRET: 'short-secret',
        FRONTEND_ORIGINS: 'not-a-url',
        PORT: '70000',
      }),
    ).toThrow(
      [
        'Invalid API configuration:',
        '- APP_ENV must be one of: local, staging, production.',
        '- AUTH_SECRET must be at least 16 characters long.',
        '- FRONTEND_ORIGINS contains an invalid URL: not-a-url.',
        '- PORT must be an integer between 1 and 65535.',
      ].join('\n'),
    );
  });
});
