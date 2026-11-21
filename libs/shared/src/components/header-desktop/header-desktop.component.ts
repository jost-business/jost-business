import { Component } from '@angular/core';
import { HeaderAuth } from '../header-auth';

@Component({
  selector: 'jost-header-desktop',
  templateUrl: './header-desktop.component.html',
  styleUrl: './header-desktop.component.scss',
})
export class HeaderDesktopComponent extends HeaderAuth {}
