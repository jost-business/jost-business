import { Trip } from '../models/travel.model';

// Pure functions about a single trip. Anything that depends on the time takes
// it as a parameter instead of reading the clock, so the caller decides which
// "now" applies and a computed() reading the clock signal stays reactive.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export interface TripProgress {
  day: number;
  totalDays: number;
  percent: number;
}

/** City part of a destination like "Casablanca, Morocco". */
export function tripCity(trip: Trip): string {
  return trip.destination.split(',')[0].trim();
}

/** Country part of a destination like "Casablanca, Morocco", or empty if there is none. */
export function tripCountry(trip: Trip): string {
  return trip.destination.split(',')[1]?.trim() ?? '';
}

/** Length of the trip like "14d 18h". */
export function tripDuration(trip: Trip): string {
  const totalHours = Math.floor((trip.to.getTime() - trip.from.getTime()) / HOUR);
  return `${Math.floor(totalHours / 24)}d ${totalHours % 24}h`;
}

export function isTripInProgress(trip: Trip, now: number): boolean {
  return trip.from.getTime() <= now && now < trip.to.getTime();
}

export function isTripCompleted(trip: Trip, now: number): boolean {
  return now >= trip.to.getTime();
}

/** "Completed", "Ongoing" or "in N days". */
export function tripStatus(trip: Trip, now: number): string {
  if (isTripCompleted(trip, now)) return 'Completed';
  if (isTripInProgress(trip, now)) return 'Ongoing';
  return `in ${Math.floor((trip.from.getTime() - now) / DAY)} days`;
}

/** Current calendar day of the trip (1-based), its total days, and the elapsed share in percent. */
export function tripProgress(trip: Trip, now: number): TripProgress {
  const totalDays = calendarDaysBetween(trip.from, trip.to) + 1;
  const day = calendarDaysBetween(trip.from, new Date(now)) + 1;
  const elapsed = (now - trip.from.getTime()) / (trip.to.getTime() - trip.from.getTime());
  return {
    day: clamp(day, 1, totalDays),
    totalDays,
    percent: Math.round(clamp(elapsed, 0, 1) * 100),
  };
}

/** Whole calendar days from the end of one trip to the start of the next. */
export function daysBetweenTrips(previous: Trip, next: Trip): number {
  return calendarDaysBetween(previous.to, next.from);
}

/** Local midnight after the given instant. */
export function startOfNextDay(instant: number): number {
  const date = new Date(instant);
  date.setHours(24, 0, 0, 0);
  return date.getTime();
}

function calendarDaysBetween(from: Date, to: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
