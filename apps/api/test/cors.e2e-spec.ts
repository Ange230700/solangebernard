import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '../src/app.setup';
import { AppModule } from '../src/app.module';
import { ApiConfigService } from '../src/config/api-config.service';

describe('CORS configuration (e2e)', () => {
  let app: NestFastifyApplication;
  const originalEnvironment = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnvironment,
      APP_ENV: 'local',
      AUTH_SECRET: 'local-dev-auth-secret-123',
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
      DESKTOP_CLIENT_ORIGINS:
        'http://127.0.0.1:4201,tauri://localhost,http://localhost:4201',
      MOBILE_CLIENT_ORIGINS:
        'http://127.0.0.1:4202,capacitor://localhost,http://localhost',
      NOTIFICATION_PROVIDER: 'noop',
      NOTIFICATION_PROVIDER_SENDER: 'Solange Bernard',
      PORT: '3000',
      WEB_CLIENT_ORIGINS: 'http://127.0.0.1:4200,http://localhost:4200',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    const apiConfig = app.get(ApiConfigService);

    configureApp(app, {
      cors: apiConfig.cors,
    });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
    process.env = originalEnvironment;
  });

  it('returns CORS headers for the configured web and desktop origins', async () => {
    const webResponse = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'http://127.0.0.1:4200',
      },
    });
    const desktopResponse = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'tauri://localhost',
      },
    });

    expect(webResponse.headers['access-control-allow-credentials']).toBe(
      'true',
    );
    expect(webResponse.headers['access-control-allow-origin']).toBe(
      'http://127.0.0.1:4200',
    );
    expect(desktopResponse.headers['access-control-allow-origin']).toBe(
      'tauri://localhost',
    );
  });

  it('returns CORS headers for the configured mobile origins', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'capacitor://localhost',
      },
    });

    expect(response.headers['access-control-allow-origin']).toBe(
      'capacitor://localhost',
    );
  });

  it('answers preflight requests with the configured methods and headers', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/health',
      headers: {
        origin: 'http://127.0.0.1:4200',
        'access-control-request-method': 'POST',
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-credentials']).toBe('true');
    expect(response.headers['access-control-allow-headers']).toContain(
      'Content-Type',
    );
    expect(response.headers['access-control-allow-headers']).toContain(
      'Authorization',
    );
    expect(response.headers['access-control-allow-methods']).toContain('POST');
  });

  it('omits CORS allow-origin headers for unapproved origins', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: 'https://unapproved.example.com',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
