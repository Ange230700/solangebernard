import { Injectable } from '@nestjs/common';

export interface HealthCheckResult {
  isHealthy: true;
}

@Injectable()
export class HealthService {
  getHealth(): HealthCheckResult {
    return { isHealthy: true };
  }
}
