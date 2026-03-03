import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  success(key: string, params?: Record<string, unknown>): void {
    this.snackBar.open(this.translate.instant(key, params), undefined, { duration: 3000 });
  }

  error(key: string, params?: Record<string, unknown>): void {
    this.snackBar.open(this.translate.instant(key, params), undefined, { duration: 4000 });
  }

  warning(key: string, params?: Record<string, unknown>): void {
    this.snackBar.open(this.translate.instant(key, params), undefined, { duration: 4000 });
  }
}
