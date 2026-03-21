import { Inject, Injectable } from '@nestjs/common';
import { API_CONFIG } from './api-config';
import type {
  ApiConfig,
  ApiCorsConfig,
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

  get cors(): ApiCorsConfig {
    return {
      ...this.config.cors,
      allowedHeaders: [...this.config.cors.allowedHeaders],
      allowedMethods: [...this.config.cors.allowedMethods],
      allowedOrigins: [...this.config.cors.allowedOrigins],
      desktopOrigins: [...this.config.cors.desktopOrigins],
      mobileOrigins: [...this.config.cors.mobileOrigins],
      webOrigins: [...this.config.cors.webOrigins],
    };
  }

  get frontendOrigins(): string[] {
    return [...this.config.cors.allowedOrigins];
  }

  get notificationProvider(): NotificationProviderConfig {
    return { ...this.config.notificationProvider };
  }

  get port(): number {
    return this.config.port;
  }
}
