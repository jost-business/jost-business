import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip, TravelYear } from '@jost/shared';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
export class TravelListComponent {
  now = signal(new Date());

  travelYears: TravelYear[] = [
    {
      year: 2026,
      trips: [
        { from: new Date(2026, 7, 11), to: new Date(2026, 7, 14), destination: 'Casablanca, Morocco' },
        { from: new Date(2026, 6, 8), to: new Date(2026, 6, 12), destination: 'Casablanca, Morocco' },
        { from: new Date(2026, 5, 10), to: new Date(2026, 5, 14), destination: 'Casablanca, Morocco' },
        { from: new Date(2026, 3, 1), to: new Date(2026, 3, 8), destination: 'Casablanca, Morocco' },
      ],
    },
    {
      year: 2025,
      trips: [
        { from: new Date(2025, 11, 21), to: new Date(2026, 0, 12), destination: 'Cabo Verde' },
        { from: new Date(2025, 9, 11), to: new Date(2025, 9, 30), destination: 'Turkey' },
      ],
    },
  ];

  getStatus = (trip: Trip) => computed(() => {
    if (this.now() > trip.to) {
      return 'Completed';
    }
    const diffMs = trip.from.getTime() - this.now().getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `in ${days} days`;
  });
}
