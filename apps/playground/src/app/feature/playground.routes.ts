import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@jost/shared';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [
    CommonModule,
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

