import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './experience.component.html',
  styleUrl: './experience.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceComponent {
  readonly data = inject(PortfolioService).data;
  readonly section = this.data.sections.experience;
}
