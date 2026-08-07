import { Component, signal } from '@angular/core';

@Component({
  selector: 'helsana-header-mobile',
  standalone: true,
  templateUrl: './helsana-header-mobile.component.html',
  styleUrl: './helsana-header-mobile.component.scss',
})
export class HelsanaHeaderMobileComponent {
  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
