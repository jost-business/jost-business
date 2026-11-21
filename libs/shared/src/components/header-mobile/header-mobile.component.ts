import { Component, signal } from '@angular/core';
import { HeaderAuth } from '../header-auth';

@Component({
  selector: 'jost-header-mobile',
  templateUrl: './header-mobile.component.html',
  styleUrl: './header-mobile.component.scss',
})
export class HeaderMobileComponent extends HeaderAuth {
  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
