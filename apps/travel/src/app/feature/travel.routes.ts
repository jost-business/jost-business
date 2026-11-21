import { Route } from '@angular/router';
import { authGuard } from '@jost/shared';
import { DashboardRouteComponent } from './dashboard-route.component';

/**
 * The dashboard is the landing page, so it ships in the main bundle. Every
 * other page is a lazy route: its code, and libraries only it uses (Leaflet
 * for the visa-free map), load the first time someone opens it.
 */
export const TRAVEL_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardRouteComponent,
  },
  {
    path: 'login',
    loadComponent: () => import('./login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'visa-free',
    loadComponent: () => import('@jost/travel/visa-free').then(m => m.TravelVisaFreeComponent),
  },
  {
    path: 'e-visa',
    loadComponent: () => import('@jost/travel/e-visa').then(m => m.TravelEVisaComponent),
  },
  // Editing needs a login. canMatch keeps the editor's code from even loading
  // for visitors; they are sent to /login instead.
  {
    path: 'trips/new',
    canMatch: [authGuard],
    loadComponent: () => import('./trip-editor-route.component').then(m => m.TripEditorRouteComponent),
  },
  {
    path: 'trip/:id/edit',
    canMatch: [authGuard],
    loadComponent: () => import('./trip-editor-route.component').then(m => m.TripEditorRouteComponent),
  },
  {
    // A trip with its own page content. Static data binds to the same `id`
    // input that the :id parameter fills on the generic route below.
    path: 'trip/2025-10-turkey',
    loadComponent: () => import('./trip-detail-route.component').then(m => m.TripDetailRouteComponent),
    data: { id: '2025-10-turkey' },
    children: [
      {
        path: '',
        loadComponent: () => import('./trips/2025-10-turkey.component').then(m => m.Turkey2025Component),
      },
    ],
  },
  {
    path: 'trip/:id',
    loadComponent: () => import('./trip-detail-route.component').then(m => m.TripDetailRouteComponent),
  },
];
