import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@jost/shared';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './playground.component.html',
  styleUrl: './playground.component.scss',
})
class PlaygroundComponent {
  inputValue = '';

  constructor(public authService: AuthService) {}

  resetInput(): void {
    this.inputValue = '';
  }
}

export const PLAYGROUND_ROUTES: Route[] = [
  {
    path: '',
    component: PlaygroundComponent,
  },
];

