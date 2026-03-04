import { computed, effect, inject, Injectable, Injector, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
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
import { EMPTY, Observable, Subscription } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { toBook, toCreateBookDto, toUpdateBookDto } from './books.mapper';

@Injectable({ providedIn: 'root' })
export class BooksStore {
  private readonly api = inject(BookstoreBffService);
  private readonly notify = inject(NotificationService);
  private readonly injector = inject(Injector);

  private readonly _initialized = signal(false);
  private readonly _reloadToken = signal(0);

  private readonly _booksStatus = signal<RequestStatusType>(RequestStatus.Idle);
  private readonly _bookDetailsStatus = signal<RequestStatusType>(RequestStatus.Idle);
  private readonly _saving = signal(false);

  private readonly _allBooks = signal<Book[]>([]);
  private readonly _selectedBook = signal<Book | null>(null);

  private readonly _search = signal('');
  private readonly _onSaleOnly = signal(false);

  private readonly _pageIndex = signal(0);
  private readonly _pageSize = signal(10);

  public readonly booksStatus = computed(() => this._booksStatus());
  public readonly bookDetailsStatus = computed(() => this._bookDetailsStatus());
  public readonly saving = computed(() => this._saving());

  public readonly search = computed(() => this._search());
  public readonly onSaleOnly = computed(() => this._onSaleOnly());

  public readonly pageIndex = computed(() => this._pageIndex());
  public readonly pageSize = computed(() => this._pageSize());

  public readonly selectedBook = computed(() => this._selectedBook());

  public readonly booksStatus$ = toObservable(this._booksStatus, { injector: this.injector });

  public readonly filteredBooks = computed(() => {
    const s = this._search().trim().toLowerCase();
    const list = this._allBooks();
    if (!s) return list;
    return list.filter(b => (b.title ?? '').toLowerCase().includes(s));
  });

  public readonly totalFilteredBooks = computed(() => this.filteredBooks().length);

  public readonly pagedBooks = computed(() => {
    const start = this._pageIndex() * this._pageSize();
    return this.filteredBooks().slice(start, start + this._pageSize());
  });

  public constructor() {
    effect(onCleanup => {
      if (!this._initialized()) return;

      const onSale = this._onSaleOnly();
      this._reloadToken();

      this._booksStatus.set(RequestStatus.Loading);

      const sub: Subscription = this.api
        .getBooks({ onSale })
        .pipe(
          map(list => list.map(toBook)),
          tap(books => {
            this._allBooks.set(books);
            this._booksStatus.set(RequestStatus.Success);
            this._pageIndex.set(0); // keep your current behavior
            this.ensureValidPage();
          }),
          catchError(() => {
            this._booksStatus.set(RequestStatus.Error);
            this.notify.error('books.snackbar.loadListError');
            return EMPTY;
          })
        )
        .subscribe();

      onCleanup(() => sub.unsubscribe());
    });
  }

  public init(): void {
    if (this._initialized()) return;
    this._initialized.set(true);
  }

  public refreshBooks(): void {
    this._reloadToken.update(x => x + 1);
  }

  public setBooksSearch(value: string): void {
    this._search.set(value);
    this._pageIndex.set(0);
    this.ensureValidPage();
  }

  public setBooksOnSaleOnly(value: boolean): void {
    this._onSaleOnly.set(value);
  }

  public setBooksPage(pageIndex: number, pageSize: number): void {
    this._pageIndex.set(pageIndex);
    this._pageSize.set(pageSize);
    this.ensureValidPage();
  }

  public createBookRequest(payload: CreateBookPayload): Observable<Book> {
    this._saving.set(true);
    const params: CreateBookRequestParams = { bookCreateDTO: toCreateBookDto(payload) };

    return this.api.createBook(params).pipe(
      map(toBook),
      tap(created => this.notify.success('books.snackbar.createSuccess', { title: created.title })),
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
    const params: UpdateBookRequestParams = { bookId, bookUpdateDTO: toUpdateBookDto(payload) };

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
    if (!book?.id) {
      this.notify.error('books.snackbar.deleteError');
      return EMPTY;
    }

    this._saving.set(true);

    return this.api.deleteBook({ bookId: book.id }).pipe(
      map(() => void 0),
      tap(() => this.notify.success('books.snackbar.deleteSuccess', { title: book.title ?? '' })),
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

    if (this._pageIndex() > lastIndex) this._pageIndex.set(lastIndex);
  }
}
