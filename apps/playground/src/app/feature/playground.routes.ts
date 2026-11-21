import { Route } from '@angular/router';
import { authGuard } from '@jost/shared';

/**
 * The whole playground needs a login. Visitors are sent to the shared login
 * page on the travel app and come back here afterwards.
 */
export const PLAYGROUND_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () => import('../dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'signals',
    canMatch: [authGuard],
    loadComponent: () => import('./playground.component').then(m => m.PlaygroundComponent),
  },
];
