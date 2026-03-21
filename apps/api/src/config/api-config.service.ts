import { Inject, Injectable } from '@nestjs/common';
import { API_CONFIG } from './api-config';
import type {
  ApiConfig,
  AppEnvironment,
  NotificationProviderConfig,
} from './api-config';

@Injectable()
export class ApiConfigService {
  constructor(@Inject(API_CONFIG) private readonly config: ApiConfig) {}

  get appEnv(): AppEnvironment {
    return this.config.appEnv;
  }

  get authSecret(): string {
    return this.config.authSecret;
  }

  get databaseUrl(): string {
    return this.config.databaseUrl;
  }

  get frontendOrigins(): string[] {
    return [...this.config.frontendOrigins];
  }

  get notificationProvider(): NotificationProviderConfig {
    return { ...this.config.notificationProvider };
  }

  get port(): number {
    return this.config.port;
  }
}
