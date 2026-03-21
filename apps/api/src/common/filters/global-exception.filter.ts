import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ErrorBody, ErrorDetail, ErrorResponse } from '@repo/contracts';

const FORBIDDEN_CODE = 'Forbidden' as const;
const INTERNAL_SERVER_ERROR_CODE = 'InternalServerError' as const;
const UNAUTHORIZED_CODE = 'Unauthorized' as const;
const VALIDATION_FAILED_CODE = 'ValidationFailed' as const;

interface ResponseWriter {
  send(body: ErrorResponse): void;
  status(code: number): ResponseWriter;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<ResponseWriter>();
    const { statusCode, body } = this.mapException(exception);

    response.status(statusCode).send(body);
  }

  private mapException(exception: unknown): {
    body: ErrorResponse;
    statusCode: number;
  } {
    if (exception instanceof HttpException) {
      return this.mapHttpException(exception);
    }

    this.logUnexpectedError(exception);

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      body: {
        error: {
          code: INTERNAL_SERVER_ERROR_CODE,
          message: 'An unexpected error occurred.',
        },
      },
    };
  }

  private mapHttpException(exception: HttpException): {
    body: ErrorResponse;
    statusCode: number;
  } {
    const statusCode = exception.getStatus();
    const rawResponse = exception.getResponse();

    if (isErrorResponse(rawResponse)) {
      return {
        statusCode,
        body: rawResponse,
      };
    }

    if (isErrorBody(rawResponse)) {
      return {
        statusCode,
        body: {
          error: rawResponse,
        },
      };
    }

    switch (statusCode) {
      case 400:
        return {
          statusCode,
          body: this.mapValidationFailure(rawResponse),
        };
      case 401:
        return {
          statusCode,
          body: {
            error: {
              code: UNAUTHORIZED_CODE,
              message: extractMessage(rawResponse) ?? 'Unauthorized',
            },
          },
        };
      case 403:
        return {
          statusCode,
          body: {
            error: {
              code: FORBIDDEN_CODE,
              message: extractMessage(rawResponse) ?? 'Forbidden',
            },
          },
        };
      default:
        if (statusCode >= 500) {
          this.logUnexpectedError(exception);

          return {
            statusCode,
            body: {
              error: {
                code: INTERNAL_SERVER_ERROR_CODE,
                message: 'An unexpected error occurred.',
              },
            },
          };
        }

        return {
          statusCode,
          body: this.mapValidationFailure(rawResponse),
        };
    }
  }

  private mapValidationFailure(rawResponse: unknown): ErrorResponse {
    const details = extractDetails(rawResponse);

    return {
      error: {
        code: VALIDATION_FAILED_CODE,
        message: 'Validation failed',
        ...(details ? { details } : {}),
      },
    };
  }

  private logUnexpectedError(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      return;
    }

    this.logger.error(String(exception));
  }
}

function extractDetails(rawResponse: unknown): ErrorDetail[] | undefined {
  if (isRecord(rawResponse) && isErrorDetailList(rawResponse.details)) {
    return rawResponse.details;
  }

  if (!isRecord(rawResponse) || !Array.isArray(rawResponse.message)) {
    return undefined;
  }

  const details = rawResponse.message
    .filter((message): message is string => typeof message === 'string')
    .map((message) => {
      const field = extractFieldName(message);

      return field ? { field, message } : { message };
    });

  return details.length > 0 ? details : undefined;
}

function extractFieldName(message: string): string | undefined {
  const propertyMatch = /^property (\S+) should not exist$/u.exec(message);

  if (propertyMatch) {
    return propertyMatch[1];
  }

  const wordMatch = /^([A-Za-z0-9_.[\]-]+)\s/u.exec(message);

  return wordMatch?.[1];
}

function extractMessage(rawResponse: unknown): string | undefined {
  if (typeof rawResponse === 'string') {
    return rawResponse;
  }

  if (!isRecord(rawResponse)) {
    return undefined;
  }

  if (typeof rawResponse.message === 'string') {
    return rawResponse.message;
  }

  return undefined;
}

function isErrorBody(value: unknown): value is ErrorBody {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    (value.details === undefined || isErrorDetailList(value.details))
  );
}

function isErrorDetailList(value: unknown): value is ErrorDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (detail) =>
        isRecord(detail) &&
        typeof detail.message === 'string' &&
        (detail.field === undefined || typeof detail.field === 'string'),
    )
  );
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    isRecord(value) &&
    isErrorBody(value.error) &&
    (value.requestId === undefined || typeof value.requestId === 'string')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
