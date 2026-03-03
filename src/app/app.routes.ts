import { Routes } from '@angular/router';
import { BooksListComponent } from '@app/modules/books/pages/books-list/books-list.component';
import { OverviewComponent } from '@app/modules/books/pages/overview/overview.component';
import { booksInitResolver } from '@core/resolvers/ books-init.resolver';

export const routes: Routes = [
  { path: '', component: OverviewComponent, resolve: { booksReady: booksInitResolver } },
  { path: 'list', component: BooksListComponent, resolve: { booksReady: booksInitResolver } },
];
