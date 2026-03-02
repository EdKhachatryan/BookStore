import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Book } from '@app/core/models/book.model';
import { BooksStore } from '@app/modules/books/data/books.store';
import { ConfirmService } from '@app/shared/services/confirm/confirm.service';
import { RequestStatus } from '@core/models/request.status';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

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

  public readonly RequestStatus = RequestStatus;

  public readonly displayedColumns = ['title', 'price', 'onSale', 'pageCount', 'actions'] as const;

  public constructor() {
    this.store.loadBooks();
  }

  public onSearch(value: string): void {
    this.store.setBooksSearch(value);
  }

  public onSaleToggle(value: boolean): void {
    this.store.setBooksOnSaleOnly(value);
  }

  public pageChanged(e: PageEvent): void {
    this.store.setBooksPage(e.pageIndex, e.pageSize);
  }

  public trackByBookId(index: number, book: Book): string {
    return book.id ?? String(index);
  }

  // Point 4 will implement create/edit dialog service.
  public createBook(): void {
    // TODO: BookDialogService.openCreate() -> store.createBookRequest(...)
  }

  public editBook(book: Book): void {
    // TODO: BookDialogService.openEdit(book) -> store.updateBookRequest(...)
  }

  public deleteBook(book: Book): void {
    this.confirm
      .confirmDeleteBook(book.title)
      .pipe(takeUntilDestroyed(), filter(Boolean))
      .subscribe(() => {
        this.store.deleteBookRequest(book).pipe(takeUntilDestroyed()).subscribe();
      });
  }
}
