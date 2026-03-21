import { Logger } from '@nestjs/common';

type HeaderValue = string | string[] | undefined;
type RequestHeaders = Record<string, HeaderValue> | undefined;
type NextFunction = () => void;
type Clock = () => bigint;

interface RequestLogger {
  log(message: string): void;
}

interface RequestLike {
  headers?: RequestHeaders;
  method?: string;
  url?: string;
}

interface ResponseLike {
  once(event: 'finish', listener: () => void): void;
  statusCode?: number;
}

const LOGGING_CONTEXT = 'RequestLoggingMiddleware';
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;

export function createRequestLoggingMiddleware(
  logger: RequestLogger = new Logger(LOGGING_CONTEXT),
  now: Clock = () => process.hrtime.bigint(),
) {
  return (request: RequestLike, response: ResponseLike, next: NextFunction) => {
    const startedAt = now();

    response.once('finish', () => {
      const durationMs = Number(
        (now() - startedAt) / NANOSECONDS_PER_MILLISECOND,
      );
      const origin = readHeaderValue(request.headers?.origin);

      logger.log(
        `${request.method ?? 'UNKNOWN'} ${request.url ?? '/'} ${response.statusCode ?? 200} ${durationMs}ms${origin ? ` origin=${origin}` : ''}`,
      );
    });

    next();
  };
}

function readHeaderValue(value: HeaderValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
