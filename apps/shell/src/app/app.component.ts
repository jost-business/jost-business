import { Component, signal } from '@angular/core';
import { HeaderComponent } from '@jost/shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = signal('Jost Business');
}

