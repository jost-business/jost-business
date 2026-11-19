import { Component, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'jost-header-mobile',
  standalone: true,
  templateUrl: './header-mobile.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header-mobile.component.scss',
})
export class HeaderMobileComponent {
  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
