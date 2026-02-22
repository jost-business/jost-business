import { Route } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '@jost/shared';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.scss',
})
class AboutMeComponent {
  constructor(public authService: AuthService) {}
}

export const ABOUT_ME_ROUTES: Route[] = [
  {
    path: '',
    component: AboutMeComponent,
  },
];

