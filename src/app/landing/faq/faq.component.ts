/**
 * FAQ — accordion. One signal (openIndex) decides which answer is open.
 * Clicking an open question closes it (sets null) — a deliberate choice:
 * users should always be able to collapse everything.
 * aria-expanded + aria-controls keep it honest for screen readers.
 */
import { Component, signal } from '@angular/core';
import { RevealDirective } from '../../shared/directives/reveal.directive';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  protected readonly items: FaqItem[] = [
    { question: 'Is there really a free plan?', answer: 'Yes. Starter is free forever — 3 projects, 2 teammates, no credit card. It is a real plan, not a trial in disguise.' },
    { question: 'Can I import from the tools we already use?', answer: 'Yes — one-click importers exist for the usual suspects (tasks, docs, boards). Dummy demo: no real import runs here.' },
    { question: 'Do you offer refunds?', answer: 'Every paid plan has a 30-day money-back guarantee. Email support and it is done, no exit interview.' },
    { question: 'Is my data used to train AI models?', answer: 'No. Your workspace data is never used for model training, on any plan.' },
    { question: 'Can I cancel anytime?', answer: 'Yes — cancel in two clicks from settings. Your data stays exportable for 90 days after cancelling.' },
  ];

  /** Index of the open item, or null when all are closed. */
  protected readonly openIndex = signal<number | null>(0);

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
