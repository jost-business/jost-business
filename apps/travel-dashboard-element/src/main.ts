import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TravelDashboardComponent } from '@jost/travel/dashboard';

createApplication({
  providers: [provideRouter([]), provideHttpClient(withFetch())],
})
  .then(({ injector }) => {
    const element = createCustomElement(TravelDashboardComponent, { injector });
    customElements.define('jost-travel-dashboard', element);
  })
  .catch(error => console.error('Failed to register jost-travel-dashboard', error));
