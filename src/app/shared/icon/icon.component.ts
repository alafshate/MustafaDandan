import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconName } from '../../models/portfolio.models';

/**
 * Single inline-SVG icon set for the whole site.
 *
 * Keeping the icons here means no icon-font or icon-library dependency, the
 * data file can reference icons by name (type-checked against `IconName`), and
 * every glyph inherits `currentColor` so it themes automatically.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('mail') {
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 6L2 7" />
        }
        @case ('phone') {
          <path
            d="M6.6 2.5a1.5 1.5 0 0 1 2 .6l1.3 2.5a1.5 1.5 0 0 1-.3 1.8L8.3 8.9a12 12 0 0 0 6.8 6.8l1.5-1.3a1.5 1.5 0 0 1 1.8-.3l2.5 1.3a1.5 1.5 0 0 1 .6 2l-.6 1.9A2 2 0 0 1 19 21 17 17 0 0 1 3 5a2 2 0 0 1 1.7-1.9Z"
          />
        }
        @case ('map-pin') {
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('linkedin') {
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <line x1="7" y1="10.5" x2="7" y2="17" />
          <circle cx="7" cy="7" r="1" />
          <path d="M11 17v-6.5" />
          <path d="M11 13a2.5 2.5 0 0 1 5 0V17" />
        }
        @case ('download') {
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
          <line x1="12" y1="15" x2="12" y2="3" />
        }
        @case ('arrow-right') {
          <line x1="4" y1="12" x2="19" y2="12" />
          <path d="m13 6 6 6-6 6" />
        }
        @case ('arrow-up-right') {
          <line x1="7" y1="17" x2="17" y2="7" />
          <path d="M8 7h9v9" />
        }
        @case ('menu') {
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        }
        @case ('close') {
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        }
        @case ('moon') {
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        }
        @case ('layers') {
          <path d="m12 2 10 5-10 5L2 7l10-5Z" />
          <path d="m2 17 10 5 10-5" />
          <path d="m2 12 10 5 10-5" />
        }
        @case ('compass') {
          <circle cx="12" cy="12" r="10" />
          <path d="m16.2 7.8-2.1 6.4-6.3 2.1 2.1-6.4 6.3-2.1Z" />
        }
        @case ('scan') {
          <path d="M3 8V5a2 2 0 0 1 2-2h3" />
          <path d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
          <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <line x1="7" y1="12" x2="17" y2="12" />
        }
        @case ('cpu') {
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
        }
        @case ('route') {
          <circle cx="6" cy="19" r="3" />
          <circle cx="18" cy="5" r="3" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        }
        @case ('git-branch') {
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        }
        @case ('file-text') {
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="14" y2="17" />
        }
        @case ('award') {
          <circle cx="12" cy="9" r="6" />
          <path d="m8.2 13.9-1.2 8 5-3 5 3-1.2-8" />
        }
        @case ('graduation-cap') {
          <path d="m12 4 10 5-10 5L2 9l10-5Z" />
          <path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" />
        }
        @case ('briefcase') {
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        }
        @case ('check') {
          <path d="m20 6-11 11-5-5" />
        }
        @case ('box') {
          <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <line x1="12" y1="22" x2="12" y2="12" />
        }
        @case ('globe') {
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        }
        @case ('shield-check') {
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        }
        @case ('users') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
          <path d="M16 3.1a4 4 0 0 1 0 7.8" />
        }
        @case ('code') {
          <path d="m16 18 6-6-6-6" />
          <path d="m8 6-6 6 6 6" />
        }
        @case ('sparkles') {
          <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
          <path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
        }
        @case ('ruler') {
          <path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z" />
          <path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2" />
        }
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `,
  ],
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly strokeWidth = input(1.6);
}
