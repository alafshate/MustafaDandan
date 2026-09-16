import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './education.component.html',
  styleUrl: './education.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EducationComponent {
  readonly data = inject(PortfolioService).data;
  readonly section = this.data.sections.education;

  /** Discrete level markers — never a fabricated percentage. */
  readonly levels = [1, 2, 3] as const;
}
