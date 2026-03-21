import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';

export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );
}
