import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from './../src/app.setup';
import { AppModule } from './../src/app.module';

describe('Health endpoint (e2e)', () => {
  let app: NestFastifyApplication;
  const originalEnvironment = process.env;

  beforeEach(async () => {
    process.env = {
      ...originalEnvironment,
      APP_ENV: 'local',
      AUTH_SECRET: 'local-dev-auth-secret-123',
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/solangebernard?schema=public',
      FRONTEND_ORIGINS: 'http://127.0.0.1:4200',
      NOTIFICATION_PROVIDER: 'noop',
      NOTIFICATION_PROVIDER_SENDER: 'Solange Bernard',
      PORT: '3000',
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
    process.env = originalEnvironment;
  });

  it('/health (GET)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
  });
});
