import { Injectable, signal } from '@angular/core';
import { Trip, TravelYear } from '../models/travel.model';

@Injectable({ providedIn: 'root' })
export class TravelService {
  private readonly now = signal(new Date());

  readonly travelYears: TravelYear[] = [
    {
      year: 2026,
      trips: [
        { id: '2026-08-casablanca', from: new Date(2026, 7, 11, 16, 5), to: new Date(2026, 7, 14, 8, 40), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-07-casablanca', from: new Date(2026, 6, 3, 16, 5), to: new Date(2026, 6, 12, 8, 40), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-06-casablanca', from: new Date(2026, 5, 5, 16, 5), to: new Date(2026, 5, 14, 8, 40), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-04-casablanca', from: new Date(2026, 3, 1), to: new Date(2026, 3, 8), destination: 'Casablanca, Morocco', photos: [] },
      ],
    },
    {
      year: 2025,
      trips: [
        { id: '2025-12-cabo-verde', from: new Date(2025, 11, 21), to: new Date(2026, 0, 12), destination: 'Cabo Verde', photos: [] },
        { id: '2025-10-turkey', from: new Date(2025, 9, 11), to: new Date(2025, 9, 30), destination: 'Turkey', photos: [
          'alanya_love.jpeg',
          'hera-hotel.jpeg',
          'hera-pool.jpeg',
          'alanya.jpeg',
          'alanya_cable_car.jpeg',
          'black_party.jpeg',
          'coast.jpeg',
          'dinner.jpeg',
          'kiss.jpeg',
          'land_of_legends_castle.jpeg',
          'laugh.jpeg',
          'pure_fear.jpeg',
          'robinson_black_party.jpeg',
          'robinson_swing.jpeg',
          'shoes.jpeg',
          'suluada-island.jpeg',
          'suluada-swim.jpeg',
          'tschiggi.jpeg',
          'view.jpeg',
          'white_party.jpeg',
        ] },
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
