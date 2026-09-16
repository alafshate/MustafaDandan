import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  signal,
} from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [IconComponent, ThemeToggleComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  readonly data = inject(PortfolioService).data;

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);
  readonly activeId = signal<string>('');

  private spy?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Marks a section active once it crosses the middle band of the viewport.
    this.spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeId.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );

    for (const link of this.data.nav) {
      const section = document.getElementById(link.id);
      if (section) {
        this.spy.observe(section);
      }
    }
  }

  ngOnDestroy(): void {
    this.spy?.disconnect();
    this.unlockScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);

    // Back at the hero, no section link should read as active.
    if (window.scrollY < 160) {
      this.activeId.set('');
      return;
    }

    // The final section can be too short to cross the observer band, so pin it
    // as active once the page is scrolled to the bottom.
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) {
      this.activeId.set(this.data.nav[this.data.nav.length - 1].id);
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 900) {
      this.closeMenu();
    }
  }

  toggleMenu(): void {
    this.menuOpen() ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.menuOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeMenu(): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    this.unlockScroll();
  }

  private unlockScroll(): void {
    document.body.style.removeProperty('overflow');
  }
}
