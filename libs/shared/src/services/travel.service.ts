import { Injectable, signal } from '@angular/core';
import { Trip, TravelYear } from '../models/travel.model';

@Injectable({ providedIn: 'root' })
export class TravelService {
  private readonly now = signal(new Date());

  readonly travelYears: TravelYear[] = [
    {
      year: 2026,
      trips: [
        { id: 'casablanca-aug-2026', from: new Date(2026, 7, 11), to: new Date(2026, 7, 14), destination: 'Casablanca, Morocco' },
        { id: 'casablanca-jul-2026', from: new Date(2026, 6, 8), to: new Date(2026, 6, 12), destination: 'Casablanca, Morocco' },
        { id: 'casablanca-jun-2026', from: new Date(2026, 5, 10), to: new Date(2026, 5, 14), destination: 'Casablanca, Morocco' },
        { id: 'casablanca-apr-2026', from: new Date(2026, 3, 1), to: new Date(2026, 3, 8), destination: 'Casablanca, Morocco' },
      ],
    },
    {
      year: 2025,
      trips: [
        { id: 'cabo-verde-2025', from: new Date(2025, 11, 21), to: new Date(2026, 0, 12), destination: 'Cabo Verde' },
        { id: 'turkey-2025', from: new Date(2025, 9, 11), to: new Date(2025, 9, 30), destination: 'Turkey' },
      ],
    },
  ];

  getTripById(id: string): Trip | undefined {
    for (const year of this.travelYears) {
      const trip = year.trips.find(t => t.id === id);
      if (trip) return trip;
    }
    return undefined;
  }

  isCompleted(trip: Trip): boolean {
    return this.now() > trip.to;
  }

  getStatus(trip: Trip): string {
    if (this.isCompleted(trip)) {
      return 'Completed';
    }
    const diffMs = trip.from.getTime() - this.now().getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `in ${days} days`;
  }
}
