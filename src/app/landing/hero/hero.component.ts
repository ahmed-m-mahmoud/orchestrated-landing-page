/**
 * Hero — PRESENTATIONAL child, but with a scroll-driven "portal" effect.
 * ============================================================================
 * THE PORTAL IDEA:
 * The hero is NOT a normal 100vh section. Its root is 200vh tall and its
 * inner content is `position: sticky; top: 0; height: 100vh`. That gives the
 * orchestrator 100vh of scroll distance (200vh wrapper − 100vh viewport)
 * during which the hero stays pinned while we transform it:
 *   - scale grows 1 → 1.6  (zooming INTO the portal)
 *   - opacity fades 1 → 0  (the hero dissolves as the next scene arrives)
 *   - the headline drifts up slightly (parallax)
 *
 * WHY the transform math lives here and not in the service:
 * The service only knows "hero progress = 0.42". HOW that number turns into
 * scale/opacity is a *presentation* decision, so it belongs to the hero.
 * The hero receives progress as a plain input and derives everything with
 * computed() signals — no scroll listener, no DOM measuring.
 */
import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  /** 0..1 — progress through the hero scene (owned by ScrollOrchestratorService). */
  readonly progress = input<number>(0);

  /** Zoom into the portal as you scroll: 1 → 1.6. */
  protected readonly scale = computed(() => 1 + this.progress() * 0.6);

  /** Fade out so the journey scene can take over cleanly. */
  protected readonly fade = computed(() => 1 - this.progress() * 0.9);

  /** Headline parallax: drifts up 60px over the whole scene. */
  protected readonly driftY = computed(() => -this.progress() * 60);

  /** The scroll cue fades first — it should be gone long before the hero is. */
  protected readonly cueOpacity = computed(() => Math.max(0, 1 - this.progress() * 3));
}
