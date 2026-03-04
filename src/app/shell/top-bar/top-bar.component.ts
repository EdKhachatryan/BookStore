import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService } from '@modules/auth/services/auth.service';
import { LoginDialogComponent } from '@modules/auth/ui/login-dialog/login-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, switchMap, take } from 'rxjs/operators';

const LS_LANG = 'mxs.lang';

@Component({
  selector: 'mxs-top-bar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, RouterLink, TranslateModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  public readonly authStore = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly translate = inject(TranslateService);

  public readonly currentLang = signal('en');

  constructor() {
    const saved = localStorage.getItem(LS_LANG) || 'en';

    this.translate.setDefaultLang('en');
    this.translate.use(saved);
  }

  public openLogin(): void {
    this.dialog
      .open(LoginDialogComponent, { width: '420px', autoFocus: false, restoreFocus: true })
      .afterClosed()
      .pipe(
        take(1),
        filter(Boolean),
        switchMap((v: any) => this.auth.login(v))
      )
      .subscribe();
  }

  public logout(): void {
    this.auth.logout();
  }

  public setLanguage(lang: string): void {
    this.translate.use(lang);
    localStorage.setItem(LS_LANG, lang);
  }
}
