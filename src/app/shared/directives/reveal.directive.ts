/**
 * ============================================================================
 * RevealDirective — scroll reveal WITHOUT a scroll listener.
 * ============================================================================
 *
 * WHY IntersectionObserver instead of scroll math?
 * The orchestrator service owns scroll progress for *connected* scenes.
 * But a simple "fade this card in when it enters the viewport" does not
 * need scroll position at all — the browser can tell us, for free, when an
 * element intersects the viewport. IntersectionObserver runs off the main
 * thread, costs nothing while idle, and fires exactly once per element.
 *
 * Usage: <div appReveal>…</div>  (optionally [appRevealDelay]="120" for stagger)
 * The directive only adds the `.is-visible` class; the transition itself
 * lives in styles.scss (.reveal), so the directive stays framework-agnostic.
 */
import { Directive, ElementRef, inject, input, OnDestroy, OnInit } from '@angular/core';

@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Optional stagger delay in ms — used by grids to reveal cards one by one. */
  readonly appRevealDelay = input<number>(0);

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const host = this.el.nativeElement;
    host.classList.add('reveal');
    if (this.appRevealDelay() > 0) {
      host.style.transitionDelay = `${this.appRevealDelay()}ms`;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            host.classList.add('is-visible');
            // Reveal once and stop observing — the element never hides again.
            this.observer?.disconnect();
          }
        }
      },
      // Start revealing slightly BEFORE the element is fully visible.
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(host);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
