import { Component, computed, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HelsanaHeaderDesktopComponent } from './helsana-header-desktop/helsana-header-desktop.component';
import { HelsanaHeaderMobileComponent } from './helsana-header-mobile/helsana-header-mobile.component';

@Component({
  selector: 'helsana-header',
  standalone: true,
  imports: [HelsanaHeaderDesktopComponent, HelsanaHeaderMobileComponent],
  templateUrl: './helsana-header.component.html',
})
export class HelsanaHeaderComponent {
  private breakpointObserver = inject(BreakpointObserver);

  private isHandset = toSignal(
    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .pipe(map((result: BreakpointState) => result.matches)),
    { initialValue: false }
  );

  isMobile = computed(() => this.isHandset());
}
