import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly data = inject(PortfolioService).data;

  /** The positioning line, split on its separators so each role can be spaced. */
  readonly titleParts = this.data.personal.title
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);
}
