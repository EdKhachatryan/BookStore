// eslint-disable-next-line no-restricted-imports
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookOverviewDetailsDialogComponent } from './book-overview-details-dialog.component';

describe('BookOverviewDetailsDialogComponent', () => {
  let component: BookOverviewDetailsDialogComponent;
  let fixture: ComponentFixture<BookOverviewDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookOverviewDetailsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookOverviewDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
