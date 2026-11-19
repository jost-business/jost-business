import { Component, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Playground';
}
