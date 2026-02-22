import { Route } from '@angular/router';
import { Component } from '@angular/core';

const HomeComponent = Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div>
      <h1>Welcome to Jost Business</h1>
      <p>Navigate to the different apps using the menu above.</p>
    </div>
  `,
})(class {});

export const APP_ROUTES: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'finance',
    loadChildren: () => import('@jost/finance/feature').then(m => m.FINANCE_ROUTES),
  },
  {
    path: 'about-me',
    loadChildren: () => import('@jost/about-me/feature').then(m => m.ABOUT_ME_ROUTES),
  },
  {
    path: 'playground',
    loadChildren: () => import('@jost/playground/feature').then(m => m.PLAYGROUND_ROUTES),
  },
];
