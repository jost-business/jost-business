import { Component, computed, inject } from '@angular/core';
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

  protected readonly publicWidgets = computed(() =>
    this.layoutService.allWidgets().filter(w => w.category === 'public')
  );

  protected readonly privateWidgets = computed(() =>
    this.layoutService.allWidgets().filter(w => w.category === 'private')
  );

  toggle(id: string): void {
    this.layoutService.toggleWidget(id);
  }

  reset(): void {
    this.layoutService.resetLayout();
  }
}
