import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { AuthStore } from '@modules/auth/data/auth.store';
import { AuthService } from '@modules/auth/services/auth.service';
import { LoginDialogComponent } from '@modules/auth/ui/login-dialog/login-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'mxs-top-bar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterLink, TranslateModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  public readonly authStore = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

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
}
