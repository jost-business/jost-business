import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FinanceMainModule } from './app/finance.main.module';

platformBrowserDynamic()
  .bootstrapModule(FinanceMainModule)
  .catch((err) => console.error(err));
