import { createRequestLoggingMiddleware } from './request-logging.middleware';

describe('createRequestLoggingMiddleware', () => {
  it('logs the completed request with method, url, status, duration, and origin', () => {
    const logger = {
      log: jest.fn(),
    };
    const ticks = [1_000_000_000n, 1_015_000_000n];
    let finishListener: (() => void) | undefined;
    const middleware = createRequestLoggingMiddleware(
      logger,
      () => ticks.shift() ?? 1_015_000_000n,
    );
    const next = jest.fn();

    middleware(
      {
        headers: {
          origin: 'http://127.0.0.1:4200',
        },
        method: 'GET',
        url: '/health',
      },
      {
        once: (_event, listener) => {
          finishListener = listener;
        },
        statusCode: 200,
      },
      next,
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(finishListener).toBeDefined();

    finishListener?.();

    expect(logger.log).toHaveBeenCalledWith(
      'GET /health 200 15ms origin=http://127.0.0.1:4200',
    );
  });

  it('logs without an origin when the request does not provide one', () => {
    const logger = {
      log: jest.fn(),
    };
    const ticks = [2_000_000_000n, 2_007_000_000n];
    let finishListener: (() => void) | undefined;
    const middleware = createRequestLoggingMiddleware(
      logger,
      () => ticks.shift() ?? 2_007_000_000n,
    );

    middleware(
      {
        method: 'POST',
        url: '/orders',
      },
      {
        once: (_event, listener) => {
          finishListener = listener;
        },
        statusCode: 500,
      },
      () => undefined,
    );

    finishListener?.();

    expect(logger.log).toHaveBeenCalledWith('POST /orders 500 7ms');
  });
});
