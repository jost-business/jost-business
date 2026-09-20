import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TravelDashboardComponent } from '@jost/travel/dashboard';

createApplication({
  providers: [provideZonelessChangeDetection(), provideRouter([])],
})
  .then(({ injector }) => {
    const element = createCustomElement(TravelDashboardComponent, { injector });
    customElements.define('jost-travel-dashboard', element);
  })
  .catch(error => console.error('Failed to register jost-travel-dashboard', error));
