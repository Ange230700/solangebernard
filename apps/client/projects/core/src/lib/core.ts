import { InjectionToken } from '@angular/core';

export interface ClientCoreConfig {
  apiBaseUrl: string;
}

export const CLIENT_CORE_CONFIG = new InjectionToken<ClientCoreConfig>(
  'CLIENT_CORE_CONFIG',
);
