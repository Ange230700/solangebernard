import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';
import { appConfig } from './app.config';

const fetchMock = vi.fn();

function createHealthResponse(): Response {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('App', () => {
  beforeEach(async () => {
    fetchMock.mockResolvedValue(createHealthResponse());
    vi.stubGlobal('fetch', fetchMock as typeof fetch);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [...(appConfig.providers ?? [])],
    }).compileComponents();
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the root router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render the default health screen without a browser runtime', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Web health check');
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(compiled.textContent).toContain('API healthy');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://127.0.0.1:3000/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          accept: 'application/json',
        }),
      }),
    );
  });
});
