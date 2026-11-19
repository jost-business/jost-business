import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HelsanaHeaderComponent } from '@jost/shared';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HelsanaHeaderComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Playground';
}
