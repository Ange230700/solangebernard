import { Component } from '@angular/core';

@Component({
  selector: 'repo-ui-web-shell',
  standalone: true,
  imports: [],
  template: `
    <section class="ui-web-shell">
      <ng-content />
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .ui-web-shell {
      display: grid;
      gap: 1rem;
    }
  `,
})
export class UiWebShell {}
