import { Component, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TripFilter, TripsStore } from '@jost/shared';
import { AdventureCountdownComponent } from './adventure-countdown/adventure-countdown.component';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, AdventureCountdownComponent],
  templateUrl: './travel-dashboard.component.html',
  styleUrl: './travel-dashboard.component.scss',
})
export class TravelDashboardComponent {
  readonly tripSelected = output<string>();

  protected readonly store = inject(TripsStore);

  protected readonly filters: { value: TripFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
  ];

  selectTrip(tripId: string): void {
    this.tripSelected.emit(tripId);
  }
}
