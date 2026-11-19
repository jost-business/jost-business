import { Injectable, computed, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Trip, TravelYear, TripDto } from '../models/travel.model';
import { API_BASE_URL } from './api';

export interface TripProgress {
  day: number;
  totalDays: number;
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class TravelService {
  private readonly apiBaseUrl = inject(API_BASE_URL);

  // Fetched once when something first reads it; the request runs again only on reload()
  private readonly tripsResource = httpResource(() => `${this.apiBaseUrl}/trips`, {
    parse: toTrips,
  });

  /**
   * All trips, newest first. Empty while loading or after an error: value()
   * throws while the resource is in its error state, so it is only read once
   * hasValue() confirms there is one.
   */
  readonly trips = computed(() => (this.tripsResource.hasValue() ? this.tripsResource.value() : []));

  readonly isLoading = this.tripsResource.isLoading;
  readonly error = this.tripsResource.error;

  /** The trips grouped by the year they start in, newest year first. */
  readonly travelYears = computed<TravelYear[]>(() => {
    const years = new Map<number, Trip[]>();
    for (const trip of this.trips()) {
      const year = trip.from.getFullYear();
      years.set(year, [...(years.get(year) ?? []), trip]);
    }
    return [...years].map(([year, trips]) => ({ year, trips })).sort((a, b) => b.year - a.year);
  });

  /** Loads the trips again, for example after a failed request. */
  reload(): void {
    this.tripsResource.reload();
  }

  getTripById(id: string): Trip | undefined {
    return this.trips().find(trip => trip.id === id);
  }

  /** The nearest trip that has not started yet, or undefined if there is none. */
  getNextTrip(): Trip | undefined {
    const now = new Date();
    return this.trips()
      .filter(trip => trip.from > now)
      .sort((a, b) => a.from.getTime() - b.from.getTime())[0];
  }

  /** The trip that is currently in progress, otherwise the next upcoming trip. */
  getCurrentOrNextTrip(): Trip | undefined {
    return this.trips()
      .find(trip => this.isInProgress(trip)) ?? this.getNextTrip();
  }

  /** City part of a destination like "Casablanca, Morocco". */
  getCity(trip: Trip): string {
    return trip.destination.split(',')[0].trim();
  }

  /** Country part of a destination like "Casablanca, Morocco", or empty if there is none. */
  getCountry(trip: Trip): string {
    return trip.destination.split(',')[1]?.trim() ?? '';
  }

  isInProgress(trip: Trip): boolean {
    const now = new Date();
    return trip.from <= now && now < trip.to;
  }

  /** Current calendar day of the trip (1-based), its total days, and the elapsed share in percent. */
  getTripProgress(trip: Trip): TripProgress {
    const now = new Date();
    const dayMs = 1000 * 60 * 60 * 24;
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const totalDays = Math.round((startOfDay(trip.to) - startOfDay(trip.from)) / dayMs) + 1;
    const day = Math.round((startOfDay(now) - startOfDay(trip.from)) / dayMs) + 1;
    const elapsed = (now.getTime() - trip.from.getTime()) / (trip.to.getTime() - trip.from.getTime());
    return {
      day: Math.min(Math.max(day, 1), totalDays),
      totalDays,
      percent: Math.round(Math.min(Math.max(elapsed, 0), 1) * 100),
    };
  }

  /** Days between the end of the previous trip and the start of this one, or null for the first trip. */
  getDaysBetween(trip: Trip): number | null {
    const previous = this.trips()
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
    return new Date() >= trip.to;
  }

  getStatus(trip: Trip): string {
    if (this.isCompleted(trip)) {
      return 'Completed';
    }
    if (this.isInProgress(trip)) {
      return 'Ongoing';
    }
    const diffMs = trip.from.getTime() - Date.now();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return `in ${days} days`;
  }
}

/** Turns the API's JSON into trips, newest first, with real Date objects. */
function toTrips(raw: unknown): Trip[] {
  if (!Array.isArray(raw)) throw new Error('Expected a list of trips from the API');
  return (raw as TripDto[])
    .map(dto => ({
      id: dto.id,
      destination: dto.destination,
      from: new Date(dto.startsAt),
      to: new Date(dto.endsAt),
      photos: dto.photos,
    }))
    .sort((a, b) => b.from.getTime() - a.from.getTime());
}
