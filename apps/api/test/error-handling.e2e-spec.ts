import {
  Controller,
  ForbiddenException,
  Get,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '../src/app.setup';

@Controller('error-probe')
class ErrorProbeController {
  @Get('unauthorized')
  getUnauthorized(): never {
    throw new UnauthorizedException();
  }

  @Get('forbidden')
  getForbidden(): never {
    throw new ForbiddenException();
  }

  @Get('unexpected')
  getUnexpected(): never {
    throw new Error('boom');
  }
}

@Module({
  controllers: [ErrorProbeController],
})
class ErrorProbeModule {}

describe('Global error handling (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ErrorProbeModule],
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
  });

  it('maps unauthorized exceptions to the shared error response shape', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/error-probe/unauthorized',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: {
        code: 'Unauthorized',
        message: 'Unauthorized',
      },
    });
  });

  it('maps forbidden exceptions to the shared error response shape', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/error-probe/forbidden',
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      error: {
        code: 'Forbidden',
        message: 'Forbidden',
      },
    });
  });

  it('hides unexpected errors behind a stable internal server error response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/error-probe/unexpected',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      error: {
        code: 'InternalServerError',
        message: 'An unexpected error occurred.',
      },
    });
  });
});
