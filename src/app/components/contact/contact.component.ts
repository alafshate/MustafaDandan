import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { SectionHeaderComponent } from '../../shared/section-header/section-header.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { inject } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [IconComponent, SectionHeaderComponent, RevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly data = inject(PortfolioService).data;
  readonly section = this.data.sections.contact;
}
