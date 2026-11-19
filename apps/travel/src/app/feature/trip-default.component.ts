import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-trip-default',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '<!-- Default trip detail (no extra content) -->',
})
export class TripDefaultComponent {}
