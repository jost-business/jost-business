import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { TravelEVisaComponent } from '@jost/travel/e-visa';

createApplication()
  .then(({ injector }) => {
    const element = createCustomElement(TravelEVisaComponent, { injector });
    customElements.define('jost-travel-e-visa', element);
  })
  .catch(error => console.error('Failed to register jost-travel-e-visa', error));
