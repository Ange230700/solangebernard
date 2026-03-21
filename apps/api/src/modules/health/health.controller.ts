import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@repo/contracts';
import { HealthService } from './health.service';
import { mapHealthResponse } from './health.response';

@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  getHealth(): HealthResponse {
    return mapHealthResponse(this.healthService.getHealth());
  }
}
