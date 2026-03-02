import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppShellComponent } from '@app/shell/app-shell/app-shell.component';
import { TranslateService } from '@ngx-translate/core';

import defaultLanguage from '../assets/i18n/en.json';

@Component({
  selector: 'mxs-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AppShellComponent],
})
export class AppComponent {
  private translateService: TranslateService = inject(TranslateService);

  constructor() {
    this.translateService.setTranslation('en', defaultLanguage);
    this.translateService.setDefaultLang('en');
  }
}
