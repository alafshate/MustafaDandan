import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly data = inject(PortfolioService).data;
  readonly section = this.data.sections.projects;

  /** Featured projects render as full-width case studies, the rest as cards. */
  readonly featured = this.data.projects.filter((project) => project.featured);
  readonly others = this.data.projects.filter((project) => !project.featured);
}
