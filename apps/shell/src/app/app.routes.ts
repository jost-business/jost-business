import { Route } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div>
      <h1>Welcome to Jost Business</h1>
      <p>Navigate to the different apps using the menu above.</p>
    </div>
  `,
})
class HomeComponent {}

export const APP_ROUTES: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
];
