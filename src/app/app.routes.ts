import { Routes } from '@angular/router';
import { booksInitResolver } from '@core/resolvers/ books-init.resolver';

export const routes: Routes = [
  {
    path: '',
    resolve: { booksReady: booksInitResolver },
    loadComponent: () => import('@app/modules/books/pages/overview/overview.component').then(m => m.OverviewComponent),
  },
  {
    path: 'list',
    resolve: { booksReady: booksInitResolver },
    loadComponent: () =>
      import('@app/modules/books/pages/books-list/books-list.component').then(m => m.BooksListComponent),
  },
];
