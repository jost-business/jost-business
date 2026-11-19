import { Component, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TravelService } from '@jost/shared';
import { AdventureCountdownComponent } from './adventure-countdown/adventure-countdown.component';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, AdventureCountdownComponent],
  templateUrl: './travel-dashboard.component.html',
  styleUrl: './travel-dashboard.component.scss',
})
export class TravelDashboardComponent {
  readonly tripSelected = output<string>();

  protected readonly travelService = inject(TravelService);

  selectTrip(tripId: string): void {
    this.tripSelected.emit(tripId);
  }

  get nextTrip() {
    return this.travelService.getCurrentOrNextTrip();
  }
}
