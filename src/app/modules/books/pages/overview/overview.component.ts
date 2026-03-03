import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BooksStore } from '@app/modules/books/data/books.store';
import { BookCardComponent } from '@books/ui/book-card/book-card.component';
import { BookOverviewDetailsDialogComponent } from '@books/ui/book-overview-details-dialog/book-overview-details-dialog.component';
import { Book } from '@core/models/book.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'mxs-overview',
  standalone: true,
  imports: [CommonModule, TranslateModule, BookCardComponent],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewComponent implements AfterViewInit, OnDestroy {
  public readonly store = inject(BooksStore);
  private readonly dialog = inject(MatDialog);

  @ViewChild('sentinel', { static: true }) private readonly sentinelRef!: ElementRef<HTMLElement>;

  private readonly images = Array.from({ length: 10 }, (_, i) => `assets/img/img_${i}.png`);

  private readonly batchSize = 9;
  private readonly visibleCount = signal<number>(9);

  private io?: IntersectionObserver;

  public readonly allBooks = computed(() => this.store.filteredBooks());
  public readonly visibleBooks = computed(() => this.allBooks().slice(0, this.visibleCount()));

  public ngAfterViewInit(): void {
    this.io = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        const next = Math.min(this.visibleCount() + this.batchSize, this.allBooks().length);
        if (next !== this.visibleCount()) this.visibleCount.set(next);
      },
      { root: null, rootMargin: '400px 0px', threshold: 0 }
    );

    this.io.observe(this.sentinelRef.nativeElement);
  }

  public ngOnDestroy(): void {
    this.io?.disconnect();
  }

  public openDetails(book: Book): void {
    this.dialog.open(BookOverviewDetailsDialogComponent, {
      width: '880px',
      maxWidth: '94vw',
      autoFocus: false,
      restoreFocus: true,
      data: {
        book,
        imageUrl: this.imageForBook(book),
      },
    });
  }

  public imageForBook(book: Book): string {
    const idx = this.hashToIndex(book.id ?? book.title ?? '', this.images.length);
    return this.images[idx];
  }

  private hashToIndex(value: string, modulo: number): number {
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    return h % modulo;
  }

  public trackById = (_: number, b: Book) => b.id;
}
