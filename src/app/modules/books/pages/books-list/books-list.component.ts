import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BooksStore } from '@app/modules/books/data/books.store';
import { BooksDialogService } from '@app/modules/books/services/books-dialog/books-dialog.service';
import { ConfirmService } from '@app/shared/services/confirm/confirm.service';
import { Book } from '@core/models/book.model';
import { RequestStatus } from '@core/models/request.status';
import { TranslateModule } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'mxs-manage-books',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
  ],
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooksListComponent {
  public readonly store = inject(BooksStore);
  private readonly confirm = inject(ConfirmService);
  private readonly dialogs = inject(BooksDialogService);

  public readonly RequestStatus = RequestStatus;
  public readonly displayedColumns = ['title', 'price', 'onSale', 'pageCount', 'actions'] as const;

  public onSearch(value: string): void {
    this.store.setBooksSearch(value);
  }

  public onSaleToggle(value: boolean): void {
    this.store.setBooksOnSaleOnly(value);
  }

  public pageChanged(e: PageEvent): void {
    this.store.setBooksPage(e.pageIndex, e.pageSize);
  }

  public createBook(): void {
    this.dialogs
      .openCreate()
      .pipe(
        take(1),
        filter((r): r is { mode: 'create'; payload: any } => !!r && r.mode === 'create'),
        switchMap(r => this.store.createBookRequest(r.payload)),
        catchError(() => EMPTY)
      )
      .subscribe();
  }

  public editBook(book: Book): void {
    this.dialogs
      .openEdit(book)
      .pipe(
        take(1),
        filter((r): r is { mode: 'edit'; bookId: string; payload: any } => !!r && r.mode === 'edit'),
        switchMap(r => this.store.updateBookRequest(r.bookId, r.payload)),
        catchError(() => EMPTY)
      )
      .subscribe();
  }

  public deleteBook(book: Book): void {
    this.confirm
      .confirmDelete('books.delete.title', 'books.delete.message', { title: book.title ?? '' })
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.store.deleteBookRequest(book)),
        catchError(() => EMPTY)
      )
      .subscribe();
  }
}
