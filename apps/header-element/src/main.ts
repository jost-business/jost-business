import { provideHttpClient, withFetch } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { HeaderComponent } from '@jost/shared';

createApplication({
  // The header shows whether someone is logged in, so it asks the API
  providers: [provideHttpClient(withFetch())],
})
  .then(({ injector }) => {
    const element = createCustomElement(HeaderComponent, { injector });
    customElements.define('jost-header', element);
  })
  .catch(error => console.error('Failed to register jost-header', error));
