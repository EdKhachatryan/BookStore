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

  public confirmDeleteBook(title: string | null | undefined): Observable<boolean> {
    return this.confirm({
      titleKey: 'books.delete.title',
      messageKey: 'books.delete.message',
      messageParams: { title: title ?? '' },
      confirmKey: 'common.delete',
      cancelKey: 'common.cancel',
      confirmIsDestructive: true,
    });
  }
}
