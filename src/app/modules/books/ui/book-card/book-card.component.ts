import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Book } from '@core/models/book.model';

@Component({
  selector: 'mxs-book-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCardComponent {
  @Input({ required: true }) public book!: Book;
  @Input({ required: true }) public imageUrl!: string;

  @Output() public cardClick = new EventEmitter<Book>();

  public onClick(): void {
    this.cardClick.emit(this.book);
  }
}
