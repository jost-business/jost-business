import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { HeaderComponent } from '@jost/shared';

createApplication({
  providers: [provideZonelessChangeDetection()],
})
  .then(({ injector }) => {
    const element = createCustomElement(HeaderComponent, { injector });
    customElements.define('jost-header', element);
  })
  .catch(error => console.error('Failed to register jost-header', error));
