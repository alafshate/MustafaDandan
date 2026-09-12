import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { portfolioData } from '../../data/portfolio.data';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsComponent {
  readonly data = portfolioData;
  readonly section = portfolioData.sections.projects;

  /** Featured projects render as full-width case studies, the rest as cards. */
  readonly featured = portfolioData.projects.filter((project) => project.featured);
  readonly others = portfolioData.projects.filter((project) => !project.featured);
}
