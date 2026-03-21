import type { HealthResponse } from '@repo/contracts';
import { mapResponse } from '../../common/responses/response-mapping';
import type { HealthCheckResult } from './health.service';

export function mapHealthResponse(
  healthCheckResult: HealthCheckResult,
): HealthResponse {
  return mapResponse(healthCheckResult, () => ({
    status: 'ok',
  }));
}
