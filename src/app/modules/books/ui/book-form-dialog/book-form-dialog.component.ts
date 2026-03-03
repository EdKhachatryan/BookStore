import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Book, CreateBookPayload, UpdateBookPayload } from '@core/models/book.model';
import { TranslateModule } from '@ngx-translate/core';
import { startWith } from 'rxjs';

export type BookFormDialogData = { mode: 'create' } | { mode: 'edit'; book: Book };

export type BookFormDialogResult =
  | { mode: 'create'; payload: CreateBookPayload }
  | { mode: 'edit'; bookId: string; payload: UpdateBookPayload };

@Component({
  selector: 'mxs-book-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSlideToggleModule,
    MatCheckbox,
  ],
  templateUrl: './book-form-dialog.component.html',
  styleUrls: ['./book-form-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<BookFormDialogComponent, BookFormDialogResult>);
  public readonly data = inject<BookFormDialogData>(MAT_DIALOG_DATA);

  public readonly isEdit = computed(() => this.data.mode === 'edit');

  public readonly form = this.fb.nonNullable.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    price: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
    pageCount: this.fb.nonNullable.control(1, [Validators.required, Validators.min(1)]),
    onSale: this.fb.nonNullable.control(false),

    lastUpdatedBy: this.fb.nonNullable.control('', [Validators.maxLength(80)]),
  });

  public readonly dialogTitleKey = computed(() => (this.isEdit() ? 'books.form.editTitle' : 'books.form.createTitle'));

  private readonly formStatus = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status,
  });

  public readonly canSubmit = computed(() => this.formStatus() === 'VALID');

  public constructor() {
    if (this.data.mode === 'edit') {
      const b = this.data.book;

      this.form.patchValue({
        title: b.title ?? '',
        price: b.price ?? 0,
        pageCount: b.pageCount ?? 1,
        onSale: !!b.onSale,
        lastUpdatedBy: b.lastUpdatedBy ?? '',
      });
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const title = v.title.trim();
    const price = Number(v.price);
    const pageCount = Number(v.pageCount);
    const onSale = !!v.onSale;

    if (this.data.mode === 'edit') {
      const book = this.data.book;

      const payload: UpdateBookPayload = {
        title,
        price,
        pageCount,
        onSale,
        lastUpdated: book.lastUpdated ?? Date.now(),
      };

      this.dialogRef.close({
        mode: 'edit',
        bookId: book.id,
        payload,
      });

      return;
    }

    const payload: CreateBookPayload = {
      title,
      price,
      pageCount,
      onSale,
    };

    this.dialogRef.close({
      mode: 'create',
      payload,
    });
  }
}
