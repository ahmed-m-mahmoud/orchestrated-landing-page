/**
 * Pricing — monthly/yearly toggle driven by ONE signal.
 * The yearly price is a computed() derived from the monthly price
 * (yearly = monthly * 10, i.e. two months free). Deriving instead of
 * hard-coding keeps the two prices from ever drifting apart.
 */
import { Component, computed, signal } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface Tier {
  name: string;
  monthly: number;
  tagline: string;
  features: string[];
  highlighted: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  /** The ONLY state here: are we showing yearly prices? */
  protected readonly yearly = signal(false);

  protected readonly tiers: Tier[] = [
    {
      name: 'Starter',
      monthly: 0,
      tagline: 'For side projects and trying things out.',
      features: ['3 projects', '2 team members', 'Community support'],
      highlighted: false,
    },
    {
      name: 'Pro',
      monthly: 12,
      tagline: 'For product teams shipping every week.',
      features: ['Unlimited projects', 'Automations', 'Timeline insights', 'Priority support'],
      highlighted: true,
    },
    {
      name: 'Scale',
      monthly: 29,
      tagline: 'For companies with many teams and audits.',
      features: ['Everything in Pro', 'SSO & audit logs', 'Dedicated success manager'],
      highlighted: false,
    },
  ];

  /** Yearly = 10x monthly (two months free). Free tier stays $0 either way. */
  protected priceFor(tier: Tier): number {
    return this.yearly() ? tier.monthly * 10 : tier.monthly;
  }

  protected periodLabel(): string {
    return this.yearly() ? '/ year' : '/ month';
  }

  protected readonly yearlySavings = computed(() => 'Save 17% with yearly billing');
}
