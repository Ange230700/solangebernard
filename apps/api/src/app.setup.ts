import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import type { ErrorDetail } from '@repo/contracts';
import type { ValidationError } from 'class-validator';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { createRequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import {
  API_CORS_ALLOWED_HEADERS,
  API_CORS_ALLOWED_METHODS,
} from './config/api-config';
import type { ApiCorsConfig } from './config/api-config';

const VALIDATION_FAILED_CODE = 'ValidationFailed' as const;

export interface AppSetupOptions {
  cors?: ApiCorsConfig;
}

export function configureApp(
  app: INestApplication,
  options: AppSetupOptions = {},
): void {
  app.use(createRequestLoggingMiddleware());
  app.enableCors(createCorsOptions(options.cors));
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

function createCorsOptions(cors?: ApiCorsConfig) {
  return {
    allowedHeaders: cors?.allowedHeaders ?? [...API_CORS_ALLOWED_HEADERS],
    credentials: cors?.allowCredentials ?? true,
    methods: cors?.allowedMethods ?? [...API_CORS_ALLOWED_METHODS],
    origin: cors ? createCorsOriginResolver(cors.allowedOrigins) : true,
  };
}

type CorsOriginCallback = (error: Error | null, allowOrigin?: boolean) => void;

function createCorsOriginResolver(allowedOrigins: readonly string[]) {
  return (origin: string | undefined, callback: CorsOriginCallback): void => {
    if (!origin) {
      callback(null, true);
      return;
    }

    callback(null, allowedOrigins.includes(origin));
  };
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
