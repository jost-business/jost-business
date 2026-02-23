import { Route } from '@angular/router';
import { FINANCE_ROUTES } from './feature/finance.routes';

export const APP_ROUTES: Route[] = [
  ...FINANCE_ROUTES,
];
