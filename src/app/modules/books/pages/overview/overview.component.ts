import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { BookDTO, BookstoreBffService } from '@openapi';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'mxs-overview',
  standalone: true,
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
})
export class OverviewComponent {
  private readonly api = inject(BookstoreBffService);

  readonly books$: Observable<BookDTO[]> = this.api.getBooks({}).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  trackByBookId(index: number, book: BookDTO): string {
    return (book as any).bookId ?? (book as any).id ?? String(index);
  }
}
