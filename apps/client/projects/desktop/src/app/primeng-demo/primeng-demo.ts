import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-primeng-demo',
  imports: [ButtonModule],
  templateUrl: './primeng-demo.html',
  styleUrl: './primeng-demo.scss',
})
export class PrimengDemo {
  protected readonly heading = 'Desktop app theme is active';
  protected readonly buttonLabel = 'PrimeNG works in desktop';
}
