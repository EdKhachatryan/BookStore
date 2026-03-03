import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogVm } from '@app/shared/models/ui.model';
import { ConfirmDialogComponent } from '@app/shared/ui/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  public confirm(vm: ConfirmDialogVm): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, {
        width: '480px',
        autoFocus: false,
        restoreFocus: true,
        data: vm,
      })
      .afterClosed()
      .pipe(map(result => result === true));
  }

  public confirmDelete(
    titleKey: string,
    messageKey: string,
    messageParams?: Record<string, unknown>
  ): Observable<boolean> {
    return this.confirm({
      titleKey,
      messageKey,
      messageParams,
      confirmKey: 'common.delete',
      cancelKey: 'common.cancel',
      confirmIsDestructive: true,
    });
  }
}
