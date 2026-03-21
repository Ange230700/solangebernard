import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@repo/contracts/health';

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
