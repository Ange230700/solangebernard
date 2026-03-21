import { Injectable } from '@nestjs/common';
import type { HealthResponse } from '@repo/contracts';

@Injectable()
export class HealthService {
  getHealth(): HealthResponse {
    return { status: 'ok' };
  }
}
