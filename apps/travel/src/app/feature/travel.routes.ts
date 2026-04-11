import { Route } from '@angular/router';
import { TravelListComponent } from './travel.component';
import { TravelDetailComponent } from './travel-detail.component';

export const TRAVEL_ROUTES: Route[] = [
  {
    path: '',
    component: TravelListComponent,
  },
  {
    path: 'trip/:id',
    component: TravelDetailComponent,
  },
];
