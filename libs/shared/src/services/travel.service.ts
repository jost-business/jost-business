import { Injectable, signal } from '@angular/core';
import { Trip, TravelYear } from '../models/travel.model';

@Injectable({ providedIn: 'root' })
export class TravelService {
  private readonly now = signal(new Date());

  readonly travelYears: TravelYear[] = [
    {
      year: 2026,
      trips: [
        { id: '2026-12-casablanca', from: new Date(2026, 11, 23, 12, 15), to: new Date(2027, 0, 6, 7, 5), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-11-casablanca', from: new Date(2026, 10, 18, 12, 15), to: new Date(2026, 10, 25, 7, 5), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-10-casablanca', from: new Date(2026, 9, 16, 15, 5), to: new Date(2026, 9, 25, 8, 40), destination: 'Casablanca, Morocco', photos: [] },
        { id: '2026-08-casablanca', from: new Date(2026, 7, 16, 16, 5), to: new Date(2026, 8, 2, 8, 40), destination: 'Casablanca, Morocco', photos: [] },
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
         {id: '2025-03-dakla', from: new Date(2025, 2, 22), to: new Date(2025, 3, 23), destination: 'Dakhla', photos: [] },
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

  /** Days between the end of the previous trip and the start of this one, or null for the first trip. */
  getDaysBetween(trip: Trip): number | null {
    const previous = this.travelYears
      .flatMap(y => y.trips)
      .filter(t => t.from < trip.from)
      .sort((a, b) => b.from.getTime() - a.from.getTime())[0];
    if (!previous) return null;
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return Math.round((startOfDay(trip.from) - startOfDay(previous.to)) / (1000 * 60 * 60 * 24));
  }

  getDuration(trip: Trip): string {
    const totalHours = Math.floor((trip.to.getTime() - trip.from.getTime()) / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}d ${hours}h`;
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
