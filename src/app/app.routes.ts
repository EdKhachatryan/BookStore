import { Routes } from '@angular/router';
import { BooksListComponent } from '@app/modules/books/pages/books-list/books-list.component';
import { OverviewComponent } from '@app/modules/books/pages/overview/overview.component';

export const routes: Routes = [
  { path: '', component: OverviewComponent },
  { path: 'list', component: BooksListComponent },
];
