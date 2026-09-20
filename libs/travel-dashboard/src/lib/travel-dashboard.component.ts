import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelService } from '@jost/shared';
import { AdventureCountdownComponent } from './adventure-countdown/adventure-countdown.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterModule, AdventureCountdownComponent],
  templateUrl: './travel-dashboard.component.html',
  styleUrl: './travel-dashboard.component.scss',
})
export class TravelDashboardComponent {
  constructor(public travelService: TravelService) {}

  get nextTrip() {
    const now = new Date();
    return this.travelService.travelYears
      .flatMap(year => year.trips)
      .filter(trip => trip.from > now)
      .sort((a, b) => a.from.getTime() - b.from.getTime())[0] ?? null;
  }
}
