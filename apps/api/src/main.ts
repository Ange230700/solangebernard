import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { ApiConfigService } from './config/api-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const apiConfig = app.get(ApiConfigService);

  configureApp(app, {
    cors: apiConfig.cors,
  });
  await app.listen(apiConfig.port, '0.0.0.0');
}
void bootstrap();
