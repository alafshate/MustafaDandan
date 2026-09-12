import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'md-portfolio-theme';

/**
 * Owns the active colour theme.
 *
 * index.html sets `data-theme` on <html> before first paint to avoid a flash;
 * this service keeps that attribute, localStorage and the UI in sync.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly current = signal<Theme>(readInitialTheme());

  readonly theme = this.current.asReadonly();
  readonly isDark = computed(() => this.current() === 'dark');

  constructor() {
    // Re-assert the attribute in case the pre-paint script was unavailable.
    document.documentElement.setAttribute('data-theme', this.current());
  }

  toggle(): void {
    this.set(this.current() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    if (theme === this.current()) {
      return;
    }

    this.current.set(theme);

    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', theme);
    window.setTimeout(() => root.classList.remove('theme-switching'), 300);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable (private mode / blocked cookies) — session only.
    }
  }
}

function readInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Ignore and fall through to the system preference.
  }

  try {
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch {
    // Ignore and fall through to the dark default.
  }

  return 'dark';
}
