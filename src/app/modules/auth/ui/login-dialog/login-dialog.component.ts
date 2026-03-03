import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

export type LoginDialogResult = { username: string; password: string };

@Component({
  selector: 'mxs-login-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<LoginDialogComponent, LoginDialogResult>);

  public readonly form = this.fb.nonNullable.group({
    username: this.fb.nonNullable.control('admin', [Validators.required]),
    password: this.fb.nonNullable.control('admin', [Validators.required]),
  });

  public cancel(): void {
    this.dialogRef.close();
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.dialogRef.close({
      username: v.username.trim(),
      password: v.password,
    });
  }
}
