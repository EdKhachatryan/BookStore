import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Book,
  CreateBookPayload,
  CreateBookRequestParams,
  UpdateBookPayload,
  UpdateBookRequestParams,
} from '@app/core/models/book.model';
import { NotificationService } from '@app/core/ui/notifications/notification.service';
import { RequestStatus, RequestStatusType } from '@core/models/request.status';
import { BookstoreBffService } from '@openapi';
import { EMPTY, Observable } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { toBook, toCreateBookDto, toUpdateBookDto } from './books.mapper';

@Injectable({ providedIn: 'root' })
export class BooksStore {
  private readonly api = inject(BookstoreBffService);
  private readonly notify = inject(NotificationService);

  private readonly _booksStatus = signal<RequestStatusType>(RequestStatus.Idle);
  private readonly _bookDetailsStatus = signal<RequestStatusType>(RequestStatus.Idle);
  private readonly _saving = signal<boolean>(false);

  private readonly _allBooks = signal<Book[]>([]);
  private readonly _selectedBook = signal<Book | null>(null);

  private readonly _search = signal<string>('');
  private readonly _onSaleOnly = signal<boolean>(false);

  private readonly _pageIndex = signal<number>(0);
  private readonly _pageSize = signal<number>(10);

  public readonly booksStatus = computed(() => this._booksStatus());
  public readonly bookDetailsStatus = computed(() => this._bookDetailsStatus());
  public readonly saving = computed(() => this._saving());

  public readonly search = computed(() => this._search());
  public readonly onSaleOnly = computed(() => this._onSaleOnly());

  public readonly pageIndex = computed(() => this._pageIndex());
  public readonly pageSize = computed(() => this._pageSize());

  public readonly selectedBook = computed(() => this._selectedBook());

  public readonly filteredBooks = computed(() => {
    const s = this._search().trim().toLowerCase();
    const onSaleOnly = this._onSaleOnly();

    let list = this._allBooks();

    if (onSaleOnly) {
      list = list.filter(b => b.onSale);
    }

    if (s) {
      list = list.filter(b => (b.title ?? '').toLowerCase().includes(s));
    }

    return list;
  });

  public readonly totalFilteredBooks = computed(() => this.filteredBooks().length);

  public readonly pagedBooks = computed(() => {
    const start = this._pageIndex() * this._pageSize();
    return this.filteredBooks().slice(start, start + this._pageSize());
  });

  public loadBooks(): void {
    if (this._booksStatus() === RequestStatus.Success || this._booksStatus() === RequestStatus.Loading) return;

    this.loadBooksRequest().pipe(takeUntilDestroyed()).subscribe();
  }

  public refreshBooks(): void {
    this.loadBooksRequest().pipe(takeUntilDestroyed()).subscribe();
  }

  public loadBooksRequest(): Observable<Book[]> {
    this._booksStatus.set(RequestStatus.Loading);

    return this.api.getBooks({ onSale: false }).pipe(
      map(list => list.map(toBook)),
      tap(books => {
        this._allBooks.set(books);
        this._booksStatus.set(RequestStatus.Success);
        this.ensureValidPage();
      }),
      catchError(() => {
        this._booksStatus.set(RequestStatus.Error);
        this.notify.error('books.snackbar.loadListError');
        return EMPTY;
      })
    );
  }

  public setBooksSearch(value: string): void {
    this._search.set(value);
    this._pageIndex.set(0);
    this.ensureValidPage();
  }

  public setBooksOnSaleOnly(value: boolean): void {
    this._onSaleOnly.set(value);
    this._pageIndex.set(0);
    this.ensureValidPage();
  }

  public setBooksPage(pageIndex: number, pageSize: number): void {
    this._pageIndex.set(pageIndex);
    this._pageSize.set(pageSize);
    this.ensureValidPage();
  }

  public loadBookDetailsRequest(bookId: string): Observable<Book> {
    this._bookDetailsStatus.set(RequestStatus.Loading);
    this._selectedBook.set(null);

    return this.api.getBook({ bookId }).pipe(
      map(toBook),
      tap(book => {
        this._selectedBook.set(book);
        this._bookDetailsStatus.set(RequestStatus.Success);
      }),
      catchError(() => {
        this._bookDetailsStatus.set(RequestStatus.Error);
        this.notify.error('books.snackbar.loadDetailsError');
        return EMPTY;
      })
    );
  }

  public clearSelectedBook(): void {
    this._selectedBook.set(null);
    this._bookDetailsStatus.set(RequestStatus.Idle);
  }

  public createBookRequest(payload: CreateBookPayload): Observable<Book> {
    this._saving.set(true);

    const params: CreateBookRequestParams = {
      bookCreateDTO: toCreateBookDto(payload),
    };

    return this.api.createBook(params).pipe(
      map(toBook),
      tap(created => {
        this.notify.success('books.snackbar.createSuccess', { title: created.title });
      }),
      tap(() => this.refreshBooks()),
      finalize(() => this._saving.set(false)),
      catchError(() => {
        this.notify.error('books.snackbar.createError');
        return EMPTY;
      })
    );
  }

  public updateBookRequest(bookId: string, payload: UpdateBookPayload): Observable<Book> {
    this._saving.set(true);

    const params: UpdateBookRequestParams = {
      bookId,
      bookUpdateDTO: toUpdateBookDto(payload),
    };

    return this.api.updateBook(params).pipe(
      map(toBook),
      tap(updated => {
        this._selectedBook.set(updated);
        this.notify.success('books.snackbar.updateSuccess', { title: updated.title });
      }),
      tap(() => this.refreshBooks()),
      finalize(() => this._saving.set(false)),
      catchError(() => {
        this.notify.error('books.snackbar.updateError');
        return EMPTY;
      })
    );
  }

  public deleteBookRequest(book: Book): Observable<void> {
    this._saving.set(true);

    return this.api.deleteBook({ bookId: book.id }).pipe(
      map(() => void 0),
      tap(() => {
        this.notify.success('books.snackbar.deleteSuccess', { title: book.title });
      }),
      tap(() => this.refreshBooks()),
      finalize(() => this._saving.set(false)),
      catchError(() => {
        this.notify.error('books.snackbar.deleteError');
        return EMPTY;
      })
    );
  }

  private ensureValidPage(): void {
    const total = this.totalFilteredBooks();
    const size = this._pageSize();
    const lastIndex = total === 0 ? 0 : Math.floor((total - 1) / size);

    if (this._pageIndex() > lastIndex) {
      this._pageIndex.set(lastIndex);
    }
  }
}
