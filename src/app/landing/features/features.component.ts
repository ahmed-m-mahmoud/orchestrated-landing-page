/**
 * Features — a plain grid section. DELIBERATELY boring, architecturally.
 * Not every section needs scroll orchestration! This one just reveals its
 * cards with the shared RevealDirective (IntersectionObserver) and staggers
 * them with [appRevealDelay]. That contrast is the lesson: use the
 * orchestrator only where sections are *connected*; use the directive
 * everywhere else.
 */
import { Component } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  protected readonly features: Feature[] = [
    { icon: '◈', title: 'Connected docs', text: 'Docs, tasks and decisions link to each other, so context is never lost between tools.' },
    { icon: '⚡', title: 'Live timelines', text: 'Every project renders as a living timeline that updates itself as work moves.' },
    { icon: '◎', title: 'Focus mode', text: 'One thing at a time. Nexus hides everything that is not your next task.' },
    { icon: '⬡', title: 'Automations', text: 'Repetitive handoffs — review requests, status pings, reminders — run themselves.' },
    { icon: '⬢', title: 'Team insights', text: 'See where work stalls before it becomes a missed deadline, without surveillance.' },
    { icon: '✦', title: 'Integrations', text: 'Plays nicely with GitHub, Slack, Figma and your calendar. Dummy list — no real calls.' },
  ];
}
