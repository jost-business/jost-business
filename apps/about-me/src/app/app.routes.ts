import { Route } from '@angular/router';
import { ABOUT_ME_ROUTES } from './feature/about-me.routes';

export const APP_ROUTES: Route[] = [
  ...ABOUT_ME_ROUTES,
];
