import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  BookFormDialogComponent,
  BookFormDialogData,
  BookFormDialogResult,
} from '@app/modules/books/ui/book-form-dialog/book-form-dialog.component';
import { Book } from '@core/models/book.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BooksDialogService {
  private readonly dialog = inject(MatDialog);

  public openCreate(): Observable<BookFormDialogResult | undefined> {
    return this.dialog
      .open<BookFormDialogComponent, BookFormDialogData, BookFormDialogResult>(BookFormDialogComponent, {
        width: '560px',
        autoFocus: false,
        restoreFocus: true,
        disableClose: true,
        data: { mode: 'create' },
      })
      .afterClosed();
  }

  public openEdit(book: Book): Observable<BookFormDialogResult | undefined> {
    return this.dialog
      .open<BookFormDialogComponent, BookFormDialogData, BookFormDialogResult>(BookFormDialogComponent, {
        width: '560px',
        autoFocus: false,
        restoreFocus: true,
        disableClose: true,
        data: { mode: 'edit', book },
      })
      .afterClosed();
  }
}
