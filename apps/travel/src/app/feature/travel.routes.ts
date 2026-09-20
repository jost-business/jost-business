import { Route } from '@angular/router';
import { TravelVisaFreeComponent } from '@jost/travel/visa-free';
import { TravelEVisaComponent } from '@jost/travel/e-visa';
import { DashboardRouteComponent } from './dashboard-route.component';
import { TripDetailRouteComponent } from './trip-detail-route.component';
import { TripDefaultComponent } from './trip-default.component';
import { Turkey2025Component } from './trips/2025-10-turkey.component';

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
    path: 'visa-free',
    component: TravelVisaFreeComponent,
  },
  {
    path: 'e-visa',
    component: TravelEVisaComponent,
  },
  {
    path: 'trip/2025-10-turkey',
    component: TripDetailRouteComponent,
    data: { tripId: '2025-10-turkey' },
    children: [
      {
        path: '',
        component: Turkey2025Component,
      },
    ],
  },
  {
    path: 'trip/:id',
    component: TripDetailRouteComponent,
    children: [
      {
        path: '',
        component: TripDefaultComponent,
      },
    ],
  },
];
