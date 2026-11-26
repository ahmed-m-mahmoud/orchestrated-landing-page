/**
 * ============================================================================
 * ScrollOrchestratorService — THE ONLY PLACE THAT LISTENS TO window.scroll.
 * ============================================================================
 *
 * THE CORE IDEA (read this first):
 * -------------------------------
 * A normal landing page lets every section listen to scroll on its own.
 * That breaks the moment sections are *connected* (an SVG spanning two
 * sections, a hero zooming into the next scene): five listeners compute the
 * same scroll position five times, fight over the DOM, and drift apart.
 *
 * Here the rule is strict:
 *   - ONE scroll listener, in THIS service, throttled with requestAnimationFrame.
 *   - The service owns three signals: scrollY, globalProgress (0..1 for the
 *     whole page), and activeSection (for the navbar highlight).
 *   - Each long "scene" (hero / journey / tornado) REGISTERS its element
 *     with registerScene(id, el). The service then exposes a per-scene
 *     progress signal (0 when the scene enters, 1 when it has fully scrolled
 *     past) via progressFor(id).
 *   - Components NEVER call window.addEventListener('scroll'). They receive
 *     a plain number through an @Input() from the LandingPage orchestrator.
 *
 * Why requestAnimationFrame throttling?
 * scroll events can fire 60-120x/second. Writing to signals on every event
 * would re-render constantly. rAF collapses all events inside one frame
 * into a single update — one signal write per frame, max.
 */
import { computed, Injectable, Signal, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollOrchestratorService {
  /** Raw scroll position in px. Rarely used directly — prefer progress. */
  readonly scrollY = signal(0);

  /** 0 at the very top of the page, 1 at the very bottom. Drives the navbar bar. */
  readonly globalProgress = signal(0);

  /** Id of the section currently under the top of the viewport (navbar highlight). */
  readonly activeSection = signal('home');

  /** Internal map: scene id -> its wrapper element (registered by LandingPage). */
  private readonly scenes = new Map<string, HTMLElement>();

  /**
   * Internal writable mirror of per-scene progress.
   * WHY a Record inside one signal instead of one signal per scene?
   * Scenes register dynamically; a single signal keeps the update loop O(n)
   * with exactly one write per frame, no matter how many scenes exist.
   */
  private readonly sceneProgressMap = signal<Record<string, number>>({});

  /** Guards the rAF throttle: true while a frame update is already queued. */
  private ticking = false;

  constructor() {
    // The ONE scroll listener in the entire app. `passive: true` tells the
    // browser we will never call preventDefault(), so scrolling stays smooth.
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll, { passive: true });
    this.update(); // initialise values for the initial viewport (no scroll yet)
  }

  /**
   * Called by the LandingPage orchestrator (in ngAfterViewInit) for each
   * long scene. The scene's progress is measured against ITS OWN height,
   * not the page height — that is what makes a 300vh scene animate slowly
   * while a normal section just scrolls past.
   */
  registerScene(id: string, element: HTMLElement): void {
    this.scenes.set(id, element);
    this.update();
  }

  unregisterScene(id: string): void {
    this.scenes.delete(id);
  }

  /**
   * Returns a READ-ONLY computed signal for one scene's progress (0..1).
   * The LandingPage calls this once per scene and passes the VALUE down
   * to children as a plain [progress] input — children never see the service.
   */
  progressFor(id: string): Signal<number> {
    return computed(() => this.sceneProgressMap()[id] ?? 0);
  }

  /** Lets the LandingPage (or a nav click) set the active section explicitly. */
  setActiveSection(id: string): void {
    this.activeSection.set(id);
  }

  /** rAF throttle: queue at most one update per animation frame. */
  private readonly onScroll = (): void => {
    if (this.ticking) return; // a frame is already queued — drop this event
    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  };

  /** The single place where scroll math happens. Runs at most once per frame. */
  private update(): void {
    const y = window.scrollY;
    this.scrollY.set(y);

    // --- Global progress: how far through the WHOLE document are we? ---
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.globalProgress.set(maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0);

    // --- Per-scene progress + active section ---
    const next: Record<string, number> = {};
    let active = 'home';

    for (const [id, el] of this.scenes) {
      const rect = el.getBoundingClientRect();
      // total = scrollable distance of THIS scene (its height minus one viewport).
      // progress 0 = scene top just hit viewport top; 1 = scene fully passed.
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      next[id] = p;

      // A scene counts as "active" once its top has crossed 40% down the viewport.
      if (rect.top <= window.innerHeight * 0.4 && rect.bottom > window.innerHeight * 0.4) {
        active = id;
      }
    }

    this.sceneProgressMap.set(next);
    this.activeSection.set(active);
  }
}
