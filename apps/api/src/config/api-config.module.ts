import { Global, Module } from '@nestjs/common';
import { config as loadDotEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { API_CONFIG, createApiConfig } from './api-config';
import { ApiConfigService } from './api-config.service';

@Global()
@Module({
  providers: [
    {
      provide: API_CONFIG,
      useFactory: () => {
        loadEnvironmentFiles();
        return createApiConfig(process.env);
      },
    },
    ApiConfigService,
  ],
  exports: [API_CONFIG, ApiConfigService],
})
export class ApiConfigModule {}

function loadEnvironmentFiles(): void {
  const envFileNames =
    process.env.NODE_ENV === 'test' ? ['.env.test', '.env'] : ['.env'];

  for (const envFileName of envFileNames) {
    const envFilePath = resolve(process.cwd(), envFileName);

    if (!existsSync(envFilePath)) {
      continue;
    }

    loadDotEnv({ path: envFilePath });
  }
}
