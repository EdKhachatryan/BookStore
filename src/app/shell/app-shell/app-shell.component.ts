import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'mxs-app-shell',
  standalone: true,
  imports: [TopBarComponent, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {}
