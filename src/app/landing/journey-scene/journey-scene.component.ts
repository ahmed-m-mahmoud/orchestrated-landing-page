/**
 * JourneyScene — THE KEY DEMO of this whole project. Read it carefully.
 * ============================================================================
 * THE PROBLEM IT SOLVES:
 * One SVG path should draw itself across what *looks* like three separate
 * sections (Discover → Build → Launch). If the SVG lived inside the Discover
 * step, it would be clipped at that step's border. If it lived in all three,
 * the three copies could never line up into one continuous line.
 *
 * THE SOLUTION:
 * The SVG lives HERE, in the scene component — one level ABOVE the steps.
 * The scene root is 300vh tall; its inner canvas is sticky (100vh) so it
 * stays pinned while the user scrolls through 200vh of scroll distance.
 * The three steps are just absolutely-positioned content OVER the SVG.
 * The SVG is `position: absolute; inset: 0` and `pointer-events: none`, so
 * it never blocks clicks on the text above it.
 *
 * HOW THE DRAWING WORKS:
 * The path has pathLength="1" (normalised: its total length counts as 1).
 * stroke-dasharray="1" makes the dash exactly as long as the path.
 * stroke-dashoffset = 1 - progress shifts the dash along the path, so at
 * progress 0 the line is invisible and at progress 1 it is fully drawn.
 * A small dot rides the same progress (cy = progress * 1900 in SVG units).
 *
 * Steps appear at progress thresholds (0.15 / 0.45 / 0.75) — pure computed()
 * booleans, no timers, no scroll listener.
 */
import { Component, computed, input } from '@angular/core';

interface JourneyStep {
  title: string;
  text: string;
  threshold: number; // progress at which this step fades in
  x: string; // horizontal placement inside the sticky canvas
  y: string;
}

@Component({
  selector: 'app-journey-scene',
  standalone: true,
  templateUrl: './journey-scene.component.html',
  styleUrl: './journey-scene.component.scss',
})
export class JourneySceneComponent {
  /** 0..1 — progress through the 300vh scene (owned by ScrollOrchestratorService). */
  readonly progress = input<number>(0);

  protected readonly steps: JourneyStep[] = [
    {
      title: '01 · Discover',
      text: 'Capture every idea, doc and decision in one place — nothing lives in a forgotten chat thread anymore.',
      threshold: 0.15,
      x: '8%',
      y: '18%',
    },
    {
      title: '02 · Build',
      text: 'Turn decisions into tasks with owners and dates. The plan updates itself as work moves — no status meetings needed.',
      threshold: 0.45,
      x: '58%',
      y: '46%',
    },
    {
      title: '03 · Launch',
      text: 'Ship with a timeline everyone can see. Launch day stops being a surprise and starts being a checklist.',
      threshold: 0.75,
      x: '8%',
      y: '72%',
    },
  ];

  /** stroke-dashoffset: 1 = fully hidden, 0 = fully drawn. */
  protected readonly dashOffset = computed(() => 1 - this.progress());

  /** The travelling dot rides the path: y in SVG units (viewBox height 2000). */
  protected readonly dotY = computed(() => 60 + this.progress() * 1880);

  /** Is step `i` visible yet? Pure function of progress — no side effects. */
  protected isStepVisible(index: number): boolean {
    return this.progress() >= this.steps[index].threshold;
  }
}
