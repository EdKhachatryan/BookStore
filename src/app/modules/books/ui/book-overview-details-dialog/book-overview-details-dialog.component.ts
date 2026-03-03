import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Book } from '@core/models/book.model';
import { TranslateModule } from '@ngx-translate/core';

export type BookOverviewDetailsDialogData = {
  book: Book;
  imageUrl: string;
};

@Component({
  selector: 'mxs-book-overview-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  templateUrl: './book-overview-details-dialog.component.html',
  styleUrls: ['./book-overview-details-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookOverviewDetailsDialogComponent {
  private readonly ref = inject(MatDialogRef<BookOverviewDetailsDialogComponent>);
  public readonly data = inject<BookOverviewDetailsDialogData>(MAT_DIALOG_DATA);

  public close(): void {
    this.ref.close();
  }
}
