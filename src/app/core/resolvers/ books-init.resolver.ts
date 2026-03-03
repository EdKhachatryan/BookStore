import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { BooksStore } from '@app/modules/books/data/books.store';
import { RequestStatus } from '@core/models/request.status';
import { filter, map, take } from 'rxjs/operators';

export const booksInitResolver: ResolveFn<boolean> = () => {
  const store = inject(BooksStore);

  store.init();

  return store.booksStatus$.pipe(
    filter(s => s === RequestStatus.Success || s === RequestStatus.Error),
    take(1),
    map(s => s === RequestStatus.Success)
  );
};
