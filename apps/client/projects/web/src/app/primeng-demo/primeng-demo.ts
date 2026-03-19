import { Component, computed, signal } from '@angular/core';
import { getHealth } from '@repo/api-client';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

type HealthState = 'loading' | 'ok' | 'error';

const API_BASE_URL = 'http://127.0.0.1:3000';

@Component({
  selector: 'app-primeng-demo',
  imports: [ButtonModule, TagModule],
  templateUrl: './primeng-demo.html',
  styleUrl: './primeng-demo.scss',
})
export class PrimengDemo {
  protected readonly heading = 'Web health check';
  protected readonly state = signal<HealthState>('loading');
  protected readonly statusText = computed(() => {
    switch (this.state()) {
      case 'ok':
        return 'API healthy';
      case 'error':
        return 'API unreachable';
      default:
        return 'Checking API';
    }
  });
  protected readonly tagSeverity = computed<'success' | 'danger' | 'contrast'>(
    () => {
      switch (this.state()) {
        case 'ok':
          return 'success';
        case 'error':
          return 'danger';
        default:
          return 'contrast';
      }
    },
  );
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    void this.loadHealth();
  }

  protected async loadHealth(): Promise<void> {
    this.state.set('loading');
    this.errorMessage.set(null);

    try {
      await getHealth({ baseUrl: API_BASE_URL });
      this.state.set('ok');
    } catch (error) {
      this.state.set('error');
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Health check failed.',
      );
    }
  }
}
