# Orchestrated Landing Page — Nexus

A complex, production-quality Angular 22 landing page that demonstrates **scroll
orchestration**: the page is not a stack of independent sections, it is
**layers orchestrated by one parent**, driven by **one single scroll listener**.

Fictional SaaS: **Nexus — one flowing workspace for product teams**.
All content is dummy data. No backend, no network calls at runtime, no
animation libraries (no GSAP) — pure Angular signals + CSS transforms.

## How to run

```bash
npm install
ng serve            # dev server at http://localhost:4200
npm run build       # production build into dist/
```

Requires Node 20+ and npm. Angular 22, standalone components, signals, SCSS.

## What you will see when you scroll

| Scene | Effect |
| --- | --- |
| **Navbar** | Fixed nav + a gradient progress bar (width = whole-page progress) + active-section highlight |
| **Hero — portal zoom** | The hero stays pinned for 200vh while it scales 1 → 1.6 and fades out — you zoom *into* the next scene |
| **Journey scene** | A 300vh sticky canvas. One big SVG path draws itself (`stroke-dashoffset = 1 − progress`) while three steps (Discover → Build → Launch) fade in at progress 0.15 / 0.45 / 0.75 |
| **Features** | 6-card grid, staggered reveal on scroll |
| **Projects tornado** | 6 project cards on a spiral that rotates a full 360° and grows as you scroll; every card stays upright and readable |
| **Stats** | Counters animate 0 → target when they enter view |
| **Testimonials** | Auto-advancing carousel (5s), pauses on hover/focus, manual dots + arrows |
| **Pricing** | Monthly/yearly toggle (yearly = monthly × 10, i.e. two months free) |
| **FAQ** | Accordion, one signal for the open index |
| **CTA + footer** | Final call-to-action and footer |

## Architecture

```
                          ┌──────────────────────────────────┐
                          │  ScrollOrchestratorService       │
                          │  (providedIn: 'root')            │
                          │  • ONE window scroll listener    │
                          │  • rAF-throttled updates         │
                          │  • scrollY / globalProgress /    │
                          │    activeSection signals         │
                          │  • progressFor(sceneId)          │
                          └──────────────┬───────────────────┘
                                         │ progress signals
                          ┌──────────────▼───────────────────┐
                          │  LandingPageComponent            │
                          │  THE ORCHESTRATOR                │
                          │  • owns layout + sticky layers   │
                          │  • registers scene elements      │
                          │  • passes [progress] down        │
                          │  • contains NO content itself    │
                          └──────────────┬───────────────────┘
              ┌────────────┬─────────────┼──────────────┬─────────────┐
              ▼            ▼             ▼              ▼             ▼
         Navbar         Hero      JourneyScene     Tornado      Features…
      [globalProgress] [progress]  [progress]     [progress]   (RevealDirective)
```

### The three rules

1. **Only `ScrollOrchestratorService` touches `window.scroll`.**
   It is throttled with `requestAnimationFrame`: at most one signal write per
   frame, no matter how many scroll events fire.
2. **The LandingPage registers scenes and passes progress down.**
   Each long scene (hero / journey / tornado) registers its wrapper element.
   The service measures that element's own height, so a 300vh scene animates
   slowly while a normal section just scrolls past. Progress flows one way:
   service → LandingPage → `[progress]` input → child. Nothing flows back up.
3. **Children are dumb/presentational.**
   They receive a number (0..1) and turn it into `transform`/`opacity` with
   `computed()`. They never measure the DOM and never listen to scroll.

### Why not one section per component?

Because the *visual* boundary is not the *ownership* boundary. An SVG that
spans Discover → Build → Launch belongs to **no single step** — if it lived
inside Discover it would be clipped at Discover's border; if it lived in all
three, the copies could never line up. So it lives **one level up**, in the
scene component, as a sibling of the steps: `position: absolute; inset: 0;
pointer-events: none`.

The same logic applies to the hero portal (the zoom belongs to the *transition
between* hero and journey) and to the tornado (the rotation belongs to the
*whole spiral*, not to any single card).

Rule of thumb: **a component is a unit of ownership/state, not a rectangle on
the screen.** Split content into small components, but lift anything that
spans sections up to the parent that can see all of them.

### What each layer uses instead of scroll listeners

| Need | Tool | Where |
| --- | --- | --- |
| Connected scroll animation (hero, journey, tornado) | `ScrollOrchestratorService` progress signals | `src/app/core/services/` |
| Simple fade-in on enter | `RevealDirective` (`IntersectionObserver`) | `src/app/shared/directives/` |
| Counters | `IntersectionObserver` + `requestAnimationFrame` | `stats/` |
| Carousel / toggle / accordion | Local `signal()` state only | `testimonials/`, `pricing/`, `faq/` |

## File tree — read in this order

```
src/
├── styles.scss                          # design tokens, .reveal, buttons, reduced-motion
├── app/
│   ├── app.ts / app.html                # root — just hosts <app-landing-page>
│   ├── core/services/
│   │   └── scroll-orchestrator.service.ts   # ★ 1 — the single scroll listener
│   ├── shared/directives/
│   │   └── reveal.directive.ts              # ★ 2 — IntersectionObserver reveal
│   └── landing/
│       ├── landing-page.component.*         # ★ 3 — THE ORCHESTRATOR
│       ├── navbar/                          # progress bar + active section
│       ├── hero/                            # portal zoom (200vh sticky)
│       ├── journey-scene/                   # shared SVG + 3 steps (300vh sticky)
│       ├── features/                        # grid + reveal stagger
│       ├── projects-tornado/                # rotating spiral (250vh sticky)
│       ├── stats/                           # rAF counters
│       ├── testimonials/                    # auto carousel
│       ├── pricing/                         # monthly/yearly toggle
│       ├── faq/                             # accordion
│       └── cta-footer/                      # final CTA + footer
```

**Read first:** `scroll-orchestrator.service.ts` → `landing-page.component.ts` →
`journey-scene.component.ts`. Those three files are the whole lesson.

## Accessibility & responsiveness

- Mobile-first, breakpoints at 768px / 1024px.
- `aria-label`s on nav, carousel, switch and progress bar; `aria-expanded` /
  `aria-controls` on the accordion; visible `:focus-visible` outlines.
- `prefers-reduced-motion` disables decorative motion (content still renders
  in its final state).

---

## بالعربي (مصري) — الفكرة باختصار

الصفحة دي مش شوية Sections فوق بعض وخلاص. هي **Layers** بيديرها Parent واحد.

- في **Listener واحد بس للـ Scroll** في العالم كله، موجود في
  `ScrollOrchestratorService`، ومتظبط بـ `requestAnimationFrame` عشان ميعملش
  Update غير مرة واحدة في كل Frame.
- الـ `LandingPageComponent` هو الـ **Orchestrator**: هو اللي بيسجّل كل Scene
  طويلة (الـ Hero والـ Journey والـ Tornado) عند الـ Service، وبياخد منها رقم
  الـ Progress (من 0 لـ 1) ويبعته للعيال كـ `[progress]` Input.
- العيال **Dumb**: بياخدوا الرقم ده ويحوّلوه لـ `scale` و `opacity` و `rotate`
  وبس. مفيش Component فيهم بيسمع Scroll ولا بيقيس الـ DOM بنفسه.

### ليه مش Component لكل Section؟

لأن الحدود اللي شايفها بعينك مش هي حدود الملكية. الـ SVG اللي ماشي من
Discover لـ Build لـ Launch مش بتاع ولا Step فيهم — لو حطيته جوه Discover
هيتقص عند حدودها، ولو كررته في التلاتة عمرهم ما هيظبطوا على بعض. فالحل إنه
يطلع **مستوى لفوق**، يعيش في الـ Scene Component كأخ للـ Steps، بـ
`position: absolute` و `pointer-events: none`.

نفس الكلام للـ Hero اللي بيعمل Zoom ويدخّلك في اللي بعده، وللـ Tornado اللي
بيلف كله على بعضه — الحاجات المتصلة دي ملك الـ Parent اللي شايفها كلها.

القاعدة: **الـ Component وحدة ملكية و State، مش مستطيل على الشاشة.**
قسّم المحتوى Components صغيرة، بس ارفع أي حاجة معدّية على أكتر من Section
للـ Parent.

### اقرأ الأول

1. `scroll-orchestrator.service.ts` — الـ Listener الوحيد والـ Progress.
2. `landing-page.component.ts` — الـ Orchestrator والتركيب.
3. `journey-scene.component.ts` — الـ SVG المشتركة والـ Steps.
