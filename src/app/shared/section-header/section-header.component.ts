import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shared section heading: numbered technical eyebrow, title and optional lead.
 * Used by every section so spacing and hierarchy stay identical site-wide.
 */
@Component({
  selector: 'app-section-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <p class="head__eyebrow">
        <span class="head__index">{{ index() }}</span>
        <span class="head__rule" aria-hidden="true"></span>
        <span>{{ eyebrow() }}</span>
      </p>
      <h2 class="head__title">{{ title() }}</h2>
      @if (lead()) {
        <p class="head__lead">{{ lead() }}</p>
      }
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .head {
        margin-bottom: 56px;
      }

      .head__eyebrow {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        font-family: var(--font-mono);
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .head__index {
        color: var(--text-muted);
      }

      .head__rule {
        width: 28px;
        height: 1px;
        background: var(--border-strong);
      }

      .head__title {
        max-width: 20ch;
        font-size: clamp(1.85rem, 1.2rem + 2.2vw, 2.75rem);
        font-weight: 700;
        line-height: 1.14;
        letter-spacing: -0.03em;
        color: var(--text-primary);
        text-wrap: balance;
      }

      .head__lead {
        max-width: 62ch;
        margin-top: 18px;
        font-size: 1.02rem;
        color: var(--text-secondary);
      }

      @media (max-width: 600px) {
        .head {
          margin-bottom: 40px;
        }
      }
    `,
  ],
})
export class SectionHeaderComponent {
  readonly index = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lead = input<string>('');
}
