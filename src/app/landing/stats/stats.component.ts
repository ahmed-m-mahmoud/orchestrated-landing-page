/**
 * Stats — animated counters WITHOUT any scroll listener.
 * An IntersectionObserver starts the count when the section enters view;
 * requestAnimationFrame drives the number from 0 to its target over ~1.4s.
 * WHY rAF and not setInterval? rAF syncs with the display refresh, so the
 * count is butter-smooth and automatically pauses in background tabs.
 * Each stat is its own signal, so Angular re-renders only the number that changed.
 */
import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss',
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  protected readonly stats: Stat[] = [
    { value: 120, suffix: '+', label: 'Projects shipped' },
    { value: 98, suffix: '%', label: 'Happy clients' },
    { value: 14, suffix: '', label: 'Countries served' },
    { value: 2400, suffix: '+', label: 'Hours saved / month' },
  ];

  /** Current displayed value per stat — starts at 0, counts up once visible. */
  protected readonly displayed = signal<number[]>(this.stats.map(() => 0));

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private started = false;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !this.started) {
          this.started = true;
          this.stats.forEach((stat, i) => this.animateTo(stat.value, i));
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Ease-out count-up over 1400ms. */
  private animateTo(target: number, index: number): void {
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic: fast start, gentle landing.
      const eased = 1 - Math.pow(1 - t, 3);
      const next = [...this.displayed()];
      next[index] = Math.round(target * eased);
      this.displayed.set(next);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}
