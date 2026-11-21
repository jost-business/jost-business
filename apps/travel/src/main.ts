import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { LOGIN_PAGE } from '@jost/shared';

import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    // Route params, query params and static data arrive as component inputs
    provideRouter(APP_ROUTES, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    // The shared login page is a route of this app
    { provide: LOGIN_PAGE, useValue: { route: '/login' } },
  ],
}).catch((err) => console.error(err));
