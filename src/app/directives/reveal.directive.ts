import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Coerces the alias attribute value (which may arrive as a string) to a number. */
function toDelay(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Reveals an element on first scroll into view.
 *
 * Usage:  <div appReveal>…</div>                 — immediate reveal
 *         <div [appReveal]="index * 70">…</div>  — staggered by index
 *
 * The element carries the global `.reveal` class (hidden state) and gains
 * `.is-revealed` once visible. The observer disconnects after firing, so a
 * revealed element never animates twice, and `prefers-reduced-motion` is
 * honoured by the global stylesheet.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
  host: { class: 'reveal' },
})
export class RevealDirective implements OnInit, OnDestroy {
  /** Stagger delay in milliseconds. */
  readonly delay = input(0, { alias: 'appReveal', transform: toDelay });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    const delay = this.delay();

    if (delay > 0) {
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    }

    // Without IntersectionObserver support, show the content straight away.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-revealed');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('is-revealed');
          this.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private disconnect(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
