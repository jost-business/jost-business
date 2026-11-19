import { computed, effect, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { Trip, TripDto } from '../models/travel.model';
import { API_BASE_URL } from '../services/api';
import { Clock } from '../services/clock';
import {
  daysBetweenTrips,
  isTripCompleted,
  isTripInProgress,
  startOfNextDay,
  tripDuration,
  tripStatus,
} from '../utils/trip';

const DAY = 24 * 60 * 60 * 1000;

export type TripFilter = 'all' | 'upcoming' | 'completed';

/** One line of the trip overview, with everything the table shows already worked out. */
export interface TripRow {
  trip: Trip;
  completed: boolean;
  status: string;
  duration: string;
  /** Days since the previous trip ended, or null for the first trip. */
  daysBetween: number | null;
}

export interface TripYear {
  year: number;
  rows: TripRow[];
}

/**
 * All trip state in one place: the trips from the API, what is current at
 * the clock's time, and the overview filter.
 *
 * Members starting with _ are private to the store; components only see the
 * state, computeds and methods without the prefix.
 */
export const TripsStore = signalStore(
  { providedIn: 'root' },

  // The only state the store owns itself; everything else is derived
  withState({ filter: 'all' as TripFilter }),

  withProps(() => {
    const apiBaseUrl = inject(API_BASE_URL);
    return {
      _clock: inject(Clock),
      // Fetched once when something first reads it; the request runs again only on reload()
      _tripsResource: httpResource(() => `${apiBaseUrl}/trips`, { parse: toTrips }),
    };
  }),

  withComputed(({ _tripsResource, _clock }) => ({
    /**
     * All trips, newest first. Empty while loading or after an error: value()
     * throws while the resource is in its error state, so it is only read once
     * hasValue() confirms there is one.
     */
    trips: computed(() => (_tripsResource.hasValue() ? _tripsResource.value() : [])),
    isLoading: _tripsResource.isLoading,
    error: _tripsResource.error,
    now: _clock.now,
  })),

  withComputed(({ trips, now }) => ({
    /** The nearest trip that has not started yet. */
    nextTrip: computed<Trip | undefined>(() =>
      trips()
        .filter(trip => trip.from.getTime() > now())
        .sort((a, b) => a.from.getTime() - b.from.getTime())[0],
    ),
    currentTrip: computed(() => trips().find(trip => isTripInProgress(trip, now()))),
  })),

  withComputed(({ trips, now, filter, nextTrip, currentTrip }) => ({
    /** The trip that is in progress, otherwise the next upcoming one. */
    currentOrNextTrip: computed(() => currentTrip() ?? nextTrip()),

    /** The overview rows matching the filter, grouped by the year a trip starts in, newest first. */
    years: computed<TripYear[]>(() => {
      const at = now();
      const all = trips();
      const years = new Map<number, TripRow[]>();
      all.forEach((trip, index) => {
        const completed = isTripCompleted(trip, at);
        if (filter() === 'upcoming' && completed) return;
        if (filter() === 'completed' && !completed) return;
        // Newest first, so the previous trip is the next one in the list
        const previous = all[index + 1];
        const row: TripRow = {
          trip,
          completed,
          status: tripStatus(trip, at),
          duration: tripDuration(trip),
          daysBetween: previous ? daysBetweenTrips(previous, trip) : null,
        };
        const year = trip.from.getFullYear();
        years.set(year, [...(years.get(year) ?? []), row]);
      });
      return [...years].map(([year, rows]) => ({ year, rows })).sort((a, b) => b.year - a.year);
    }),

    /**
     * The next instant at which anything derived from the time changes: a trip
     * starts or ends, "in N days" counts down, or a new calendar day begins.
     */
    _nextChangeAt: computed(() => {
      const at = now();
      const candidates = [startOfNextDay(at)];
      for (const trip of trips()) {
        const start = trip.from.getTime();
        const end = trip.to.getTime();
        if (start > at) candidates.push(start, at + ((start - at) % DAY || DAY));
        if (end > at) candidates.push(end);
      }
      return Math.min(...candidates);
    }),
  })),

  withMethods(store => ({
    setFilter(filter: TripFilter): void {
      patchState(store, { filter });
    },

    /** Loads the trips again, for example after a failed request. */
    reload(): void {
      store._tripsResource.reload();
    },

    /** Reads the trips signal, so calling it inside a computed or template stays reactive. */
    tripById(id: string): Trip | undefined {
      return store.trips().find(trip => trip.id === id);
    },
  })),

  withHooks({
    onInit(store) {
      // One timer to exactly the next change instead of polling; when it fires
      // the clock moves on, _nextChangeAt is recomputed and this schedules again
      effect(() => store._clock.refreshAt(store._nextChangeAt()));
    },
  }),
);

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
