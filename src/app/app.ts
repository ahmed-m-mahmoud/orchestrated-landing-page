/**
 * App root — intentionally tiny. The whole page is the LandingPage;
 * there is no routing in this demo, so the root just hosts it.
 */
import { Component } from '@angular/core';
import { LandingPageComponent } from './landing/landing-page.component';

@Component({
  imports: [LandingPageComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
