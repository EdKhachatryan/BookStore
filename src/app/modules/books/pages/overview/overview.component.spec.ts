import { OverviewComponent } from '@app/modules/books/pages/overview/overview.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { BookstoreBffService } from '@openapi';

describe('OverviewComponent', () => {
  let spectator: Spectator<OverviewComponent>;
  const createComponent = createComponentFactory({
    component: OverviewComponent,
    imports: [],
    mocks: [BookstoreBffService],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create the app', () => {
    expect(spectator.component).toBeTruthy();
  });
});
