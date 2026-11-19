import { Component, signal } from '@angular/core';
import { DashboardGridComponent } from './components/dashboard-grid/dashboard-grid.component';
import { WidgetPickerComponent } from './components/widget-picker/widget-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardGridComponent, WidgetPickerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
