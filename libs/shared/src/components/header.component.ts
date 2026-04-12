import { Component, computed, inject } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { HeaderDesktopComponent } from './header-desktop/header-desktop.component';
import { HeaderMobileComponent } from './header-mobile/header-mobile.component';

@Component({
  selector: 'jost-header',
  standalone: true,
  imports: [HeaderDesktopComponent, HeaderMobileComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private breakpointObserver = inject(BreakpointObserver);

  private isHandset = toSignal(
    this.breakpointObserver
      .observe(['(max-width: 767.98px)'])
      .pipe(map((result: BreakpointState) => result.matches)),
    { initialValue: false }
  );

  isMobile = computed(() => this.isHandset());
}
