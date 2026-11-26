/**
 * ============================================================================
 * LandingPageComponent — THE ORCHESTRATOR. This is the file the whole
 * project is about. Read it top to bottom before touching anything else.
 * ============================================================================
 *
 * THE MENTAL MODEL — LAYERS, NOT SECTIONS:
 * -----------------------------------------
 * A naive landing page is a stack of independent sections:
 *   Hero / Features / Testimonials / Pricing ...
 * That works until the design is *connected* — an SVG that flows from one
 * section into the next, a hero that zooms into the scene below it, a spiral
 * that spins as you scroll. Then "one component per visual rectangle" breaks,
 * because the connected element belongs to NO single rectangle.
 *
 * This page is therefore organised as LAYERS owned by ONE parent:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  LandingPage (THIS FILE) — owns layout + sticky layers   │
 *   │   ├─ ScrollOrchestratorService — ONE scroll listener     │
 *   │   ├─ <app-navbar>        [globalProgress, activeSection] │
 *   │   ├─ <app-hero>          [progress]  ← portal zoom       │
 *   │   ├─ <app-journey-scene> [progress]  ← shared SVG + steps│
 *   │   ├─ <app-features>      (plain, RevealDirective only)   │
 *   │   ├─ <app-projects-tornado> [progress] ← spiral          │
 *   │   ├─ <app-stats> / <app-testimonials> / <app-pricing>    │
 *   │   ├─ <app-faq>                                            │
 *   │   └─ <app-cta-footer>                                     │
 *   └─────────────────────────────────────────────────────────┘
 *
 * THE THREE RULES:
 *  1. Only ScrollOrchestratorService touches window.scroll (rAF-throttled).
 *  2. This component registers each long scene's element with the service
 *     and passes the resulting progress DOWN as a plain [progress] input.
 *  3. Children are dumb: they turn a number into transforms. They never
 *     measure the DOM and never listen to scroll. They also contain NO
 *     business content of their own beyond their own dummy data.
 *
 * This component itself contains NO content — only composition. If you open
 * this file and see a headline or a price, something went wrong.
 */
import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ScrollOrchestratorService } from '../core/services/scroll-orchestrator.service';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { JourneySceneComponent } from './journey-scene/journey-scene.component';
import { FeaturesComponent } from './features/features.component';
import { ProjectsTornadoComponent } from './projects-tornado/projects-tornado.component';
import { StatsComponent } from './stats/stats.component';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { PricingComponent } from './pricing/pricing.component';
import { FaqComponent } from './faq/faq.component';
import { CtaFooterComponent } from './cta-footer/cta-footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    JourneySceneComponent,
    FeaturesComponent,
    ProjectsTornadoComponent,
    StatsComponent,
    TestimonialsComponent,
    PricingComponent,
    FaqComponent,
    CtaFooterComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements AfterViewInit {
  /** The single source of scroll truth. Exposed to the template (protected is fine — the template is part of this class). */
  protected readonly scroll = inject(ScrollOrchestratorService);

  /**
   * Per-scene progress signals, created ONCE here and read in the template.
   * Each is a computed() over the service's internal map, so children get a
   * fresh number every frame without any of them subscribing to scroll.
   */
  protected readonly heroProgress = this.scroll.progressFor('hero');
  protected readonly journeyProgress = this.scroll.progressFor('journey');
  protected readonly tornadoProgress = this.scroll.progressFor('projects');

  /**
   * Template refs to the scene wrappers. WHY wrappers and not the child
   * components themselves? The service measures getBoundingClientRect() of
   * the SCENE (e.g. the 300vh journey wrapper). The wrapper IS the scene's
   * scroll distance, so it is the correct element to measure.
   */
  private readonly heroScene = viewChild<ElementRef<HTMLElement>>('heroScene');
  private readonly journeyScene = viewChild<ElementRef<HTMLElement>>('journeyScene');
  private readonly featuresScene = viewChild<ElementRef<HTMLElement>>('featuresScene');
  private readonly tornadoScene = viewChild<ElementRef<HTMLElement>>('tornadoScene');
  private readonly pricingScene = viewChild<ElementRef<HTMLElement>>('pricingScene');
  private readonly faqScene = viewChild<ElementRef<HTMLElement>>('faqScene');

  ngAfterViewInit(): void {
    // Register every scene AFTER the view exists — the elements must be in
    // the DOM before the service can measure them. Registration also triggers
    // an immediate update() so progress is correct before the first scroll.
    // NOTE: features/pricing/faq are registered too — not because they animate
    // with progress, but so the service can compute `activeSection` for the
    // navbar highlight across the whole page.
    this.register('hero', this.heroScene());
    this.register('journey', this.journeyScene());
    this.register('features', this.featuresScene());
    this.register('projects', this.tornadoScene());
    this.register('pricing', this.pricingScene());
    this.register('faq', this.faqScene());
  }

  private register(id: string, ref: ElementRef<HTMLElement> | undefined): void {
    if (ref) this.scroll.registerScene(id, ref.nativeElement);
  }
}
