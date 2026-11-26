/**
 * Testimonials — auto-advancing carousel, fully local state.
 * A signal holds the current index; setInterval advances it every 5s.
 * Hovering pauses (paused signal) — a small UX detail that matters.
 * No scroll involvement at all: this is a self-contained widget, which is
 * exactly why it lives in its own component instead of the orchestrator.
 */
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  protected readonly testimonials: Testimonial[] = [
    { quote: 'Nexus replaced four tools for us. Our Monday status meeting simply disappeared.', name: 'Sara Khalil', role: 'Product Lead, Cairo' },
    { quote: 'The timeline view is the first thing our clients actually understand without a walkthrough.', name: 'Omar Farouk', role: 'Founder, Riyadh' },
    { quote: 'We shipped a quarter early. I still do not fully believe it.', name: 'Lina Haddad', role: 'Engineering Manager, Dubai' },
  ];

  protected readonly current = signal(0);
  protected readonly paused = signal(false);

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      if (!this.paused()) this.next();
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  protected goTo(index: number): void {
    this.current.set(index);
  }

  protected next(): void {
    this.current.update((i) => (i + 1) % this.testimonials.length);
  }

  protected prev(): void {
    this.current.update((i) => (i - 1 + this.testimonials.length) % this.testimonials.length);
  }
}
