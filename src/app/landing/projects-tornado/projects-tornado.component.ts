/**
 * ProjectsTornado — Ahmed's tornado/spiral idea, implemented scroll-driven.
 * ============================================================================
 * THE GEOMETRY:
 * Six project cards sit on a spiral, not a grid. Each card's angle is fixed
 * (i * 60°), but its RADIUS grows with its index (100px + i * 26px), so the
 * ring becomes a spiral. The whole spiral then rotates with scroll progress
 * (progress * 360°) and scales up slightly (0.8 → 1.05) as you scroll through
 * the 250vh scene — the tornado "grows and spins" exactly as Ahmed imagined.
 *
 * THE TRANSFORM TRICK (read carefully):
 * Each card is positioned with THREE transforms, in this order:
 *   rotate(angle) → translate(radius) → rotate(-angle)
 * The first rotate moves the card around the centre; translate pushes it
 * outward along that rotated axis; the second rotate (negative) un-rotates
 * the card itself so its text stays upright and readable.
 * Without the third rotate, every card would be tilted like a ferris wheel.
 *
 * Like the hero, this component only receives [progress] — all math is
 * computed() from that single number.
 */
import { Component, computed, input } from '@angular/core';

interface Project {
  name: string;
  stack: string;
  description: string;
}

@Component({
  selector: 'app-projects-tornado',
  standalone: true,
  templateUrl: './projects-tornado.component.html',
  styleUrl: './projects-tornado.component.scss',
})
export class ProjectsTornadoComponent {
  /** 0..1 — progress through the tornado scene (owned by ScrollOrchestratorService). */
  readonly progress = input<number>(0);

  protected readonly projects: Project[] = [
    { name: 'ShaderERP', stack: 'Angular 19 · .NET Core', description: 'Financial tracking ERP for a trading company — live in production.' },
    { name: 'Estatly AI', stack: 'Angular · RAG · AI', description: 'Multi-tenant real-estate SaaS that analyses agency documents with AI.' },
    { name: 'Nexus ERP', stack: 'Angular · Nx · Micro-frontends', description: 'Modular ERP shell with dynamic remotes and Nx Affected CI.' },
    { name: 'Workshop Flow', stack: 'Angular · RTL · Arabic', description: 'Accounting demo for a carpentry workshop: credit, instalments, cash.' },
    { name: 'Ledger Lite', stack: 'Angular · Signals', description: 'A tiny ledger app — the seed of the 90-day AI engineer plan.' },
    { name: 'Orbit Portfolio', stack: 'Angular · CSS Scroll Animations', description: 'This page. A creative portfolio with a zoom portal and a tornado.' },
  ];

  /** Whole-spiral rotation: one full turn over the scene. */
  protected readonly spiralRotation = computed(() => this.progress() * 360);
  /** Whole-spiral scale: grows from 0.8 (small, far) to 1.05 (close). */
  protected readonly spiralScale = computed(() => 0.8 + this.progress() * 0.25);

  /** Angle of card i around the centre (evenly spaced). */
  protected angleFor(index: number): number {
    return index * (360 / this.projects.length);
  }

  /**
   * Radius of card i — grows with index, which turns the circle into a spiral.
   * Viewport-aware: on narrow screens the spiral shrinks so the outermost
   * cards are not clipped by the viewport edge (the sticky canvas hides
   * horizontal overflow). Read at render time — cheap, and it only changes
   * when the template re-evaluates on scroll/resize.
   */
  protected radiusFor(index: number): number {
    const narrow = typeof window !== 'undefined' && window.innerWidth < 768;
    return narrow ? 62 + index * 14 : 110 + index * 26;
  }

  /**
   * The three-step transform. Order matters: rotate → translate → counter-rotate.
   * (See the header comment for why the counter-rotate keeps text upright.)
   */
  protected transformFor(index: number): string {
    const angle = this.angleFor(index);
    const radius = this.radiusFor(index);
    return `rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`;
  }
}
