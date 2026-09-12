import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { portfolioData } from '../../data/portfolio.data';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly data = portfolioData;

  /** The positioning line, split on its separators so each role can be spaced. */
  readonly titleParts = portfolioData.personal.title
    .split('·')
    .map((part) => part.trim())
    .filter(Boolean);
}
