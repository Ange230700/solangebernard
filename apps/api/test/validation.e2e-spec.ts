import { Body, Controller, Module, Post } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { IsString, MinLength } from 'class-validator';
import { configureApp } from '../src/app.setup';

class ValidationProbeRequest {
  @IsString()
  @MinLength(3)
  name!: string;
}

@Controller()
class ValidationProbeController {
  @Post('validation-probe')
  createProbe(@Body() body: ValidationProbeRequest): ValidationProbeRequest {
    return body;
  }
}

@Module({
  controllers: [ValidationProbeController],
})
class ValidationProbeModule {}

describe('Global validation (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ValidationProbeModule],
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

  it('rejects invalid request bodies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/validation-probe',
      payload: {
        name: 'ab',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'ValidationFailed',
        message: 'Validation failed',
        details: [
          {
            field: 'name',
            message: 'name must be longer than or equal to 3 characters',
          },
        ],
      },
    });
  });

  it('rejects non-whitelisted request fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/validation-probe',
      payload: {
        name: 'valid',
        role: 'admin',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: {
        code: 'ValidationFailed',
        message: 'Validation failed',
        details: [
          {
            field: 'role',
            message: 'property role should not exist',
          },
        ],
      },
    });
  });
});
