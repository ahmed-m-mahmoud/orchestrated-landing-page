/**
 * Navbar — PRESENTATIONAL child.
 * Receives globalProgress + activeSection as inputs from the LandingPage.
 * It never reads scroll itself; it only *renders* what the orchestrator gives it.
 * The thin bar at the very top is the page-wide progress indicator.
 */
import { Component, input, signal } from '@angular/core';

interface NavLink {
  id: string;
  label: string;
  href: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  /** 0..1 — how far through the whole page (drives the top progress bar). */
  readonly globalProgress = input<number>(0);
  /** Id of the section currently in view (drives the active link highlight). */
  readonly activeSection = input<string>('home');

  /** Local UI state only — the mobile menu is the navbar's own business. */
  protected readonly menuOpen = signal(false);

  protected readonly links: NavLink[] = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'journey', label: 'Journey', href: '#journey' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'faq', label: 'FAQ', href: '#faq' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
