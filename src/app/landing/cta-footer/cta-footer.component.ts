/**
 * CTA + Footer — the last thing on the page. Purely presentational:
 * a big gradient call-to-action and a simple footer. No state, no scroll.
 */
import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

@Component({
  selector: 'app-cta-footer',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './cta-footer.component.html',
  styleUrl: './cta-footer.component.scss',
})
export class CtaFooterComponent {}
