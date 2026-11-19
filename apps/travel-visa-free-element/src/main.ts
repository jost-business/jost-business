import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { TravelVisaFreeComponent } from '@jost/travel/visa-free';

createApplication()
  .then(({ injector }) => {
    const element = createCustomElement(TravelVisaFreeComponent, { injector });
    customElements.define('jost-travel-visa-free', element);
  })
  .catch(error => console.error('Failed to register jost-travel-visa-free', error));
