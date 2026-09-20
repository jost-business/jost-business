import { Route } from '@angular/router';
import { TravelDashboardComponent } from '@jost/travel-dashboard';
import { TravelVisaFreeComponent } from '@jost/travel-visa-free';
import { TravelEVisaComponent } from '@jost/travel-e-visa';
import { TravelDetailComponent } from './travel-detail.component';
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
    component: TravelDashboardComponent,
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
    component: TravelDetailComponent,
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
    component: TravelDetailComponent,
    children: [
      {
        path: '',
        component: TripDefaultComponent,
      },
    ],
  },
];
