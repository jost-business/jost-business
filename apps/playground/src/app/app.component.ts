import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent, HelsanaHeaderComponent } from '@jost/shared';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    HeaderComponent,
    HelsanaHeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Playground';
}
