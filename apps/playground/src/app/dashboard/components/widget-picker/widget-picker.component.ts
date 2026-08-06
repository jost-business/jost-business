import { Component, inject, signal } from '@angular/core';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-widget-picker',
  standalone: true,
  imports: [],
  templateUrl: './widget-picker.component.html',
  styleUrl: './widget-picker.component.scss',
})
export class WidgetPickerComponent {
  protected readonly layoutService = inject(LayoutService);

  toggle(id: string): void {
    this.layoutService.toggleWidget(id);
  }

  reset(): void {
    this.layoutService.resetLayout();
  }
}
