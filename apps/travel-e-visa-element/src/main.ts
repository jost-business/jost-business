import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { TravelEVisaComponent } from '@jost/travel-e-visa';

createApplication({
  providers: [provideZonelessChangeDetection()],
})
  .then(({ injector }) => {
    const element = createCustomElement(TravelEVisaComponent, { injector });
    customElements.define('jost-travel-e-visa', element);
  })
  .catch(error => console.error('Failed to register jost-travel-e-visa', error));
