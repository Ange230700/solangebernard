import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { ErrorDetail } from '@repo/contracts';
import type { ValidationError } from 'class-validator';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

const VALIDATION_FAILED_CODE = 'ValidationFailed' as const;

export function configureApp(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) =>
        new BadRequestException({
          code: VALIDATION_FAILED_CODE,
          message: 'Validation failed',
          details: flattenValidationErrors(errors),
        }),
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
}

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath?: string,
): ErrorDetail[] {
  return errors.flatMap((error) => {
    const field = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const details = Object.values(error.constraints ?? {}).map((message) => ({
      field,
      message,
    }));

    return [
      ...details,
      ...flattenValidationErrors(error.children ?? [], field),
    ];
  });
}
