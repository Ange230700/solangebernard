/* eslint-disable @angular-eslint/component-selector */
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { Input } from '@angular/core';

vi.mock('@ionic/angular/standalone', async () => {
  const { Component } = await import('@angular/core');
  const { RouterOutlet } = await import('@angular/router');

  @Component({
    selector: 'ion-app',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonApp {}

  @Component({
    selector: 'ion-router-outlet',
    standalone: true,
    imports: [RouterOutlet],
    template: '<router-outlet></router-outlet>',
  })
  class IonRouterOutlet {}

  @Component({
    selector: 'ion-badge',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonBadge {
    @Input() color = '';
  }

  @Component({
    selector: 'ion-button',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonButton {
    @Input() disabled = false;
  }

  @Component({
    selector: 'ion-content',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonContent {
    @Input() fullscreen = false;
  }

  @Component({
    selector: 'ion-header',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonHeader {
    @Input() translucent = false;
  }

  @Component({
    selector: 'ion-title',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonTitle {}

  @Component({
    selector: 'ion-toolbar',
    standalone: true,
    template: '<ng-content></ng-content>',
  })
  class IonToolbar {}

  return {
    provideIonicAngular: () => [],
    IonApp,
    IonBadge,
    IonButton,
    IonContent,
    IonHeader,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
  };
});

const fetchMock = vi.fn();

let App: (typeof import('./app'))['App'];
let routes: (typeof import('./app.routes'))['routes'];

function createHealthResponse(): Response {
  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('App', () => {
  beforeAll(async () => {
    ({ App } = await import('./app'));
    ({ routes } = await import('./app.routes'));
  });

  beforeEach(async () => {
    fetchMock.mockResolvedValue(createHealthResponse());
    vi.stubGlobal('fetch', fetchMock as typeof fetch);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
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

  it('should render the Ionic app shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ion-app')).toBeTruthy();
  });

  it('should render the default mobile health screen without Capacitor', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    fixture.detectChanges();
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mobile Health');
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
