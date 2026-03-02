import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'mxs-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  // Later:
  // - inject(AuthStore) and show login/user menu based on isAuthenticated()
}
