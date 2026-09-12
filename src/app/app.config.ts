import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

/**
 * The site is a single page navigated by anchors, so no router is configured —
 * that keeps the bundle to just what the page needs.
 */
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true })],
};
