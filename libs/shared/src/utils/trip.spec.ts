import { Trip } from '../models/travel.model';
import {
  daysBetweenTrips,
  isTripCompleted,
  isTripInProgress,
  tripCity,
  tripCountry,
  tripDuration,
  tripProgress,
  tripStatus,
} from './trip';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Local times, so calendar-day maths does not depend on the test machine's zone
const trip: Trip = {
  id: 'casablanca',
  destination: 'Casablanca, Morocco',
  from: new Date(2030, 5, 2, 14, 0),
  to: new Date(2030, 5, 10, 8, 0),
  photos: [],
};
const start = trip.from.getTime();
const end = trip.to.getTime();

describe('trip utils', () => {
  it('splits the destination into city and country', () => {
    expect(tripCity(trip)).toBe('Casablanca');
    expect(tripCountry(trip)).toBe('Morocco');
    expect(tripCountry({ ...trip, destination: 'Dakhla' })).toBe('');
  });

  it('formats the duration in days and hours', () => {
    expect(tripDuration(trip)).toBe('7d 18h');
  });

  it('treats the start as in progress and the end as completed', () => {
    expect(isTripInProgress(trip, start - 1)).toBe(false);
    expect(isTripInProgress(trip, start)).toBe(true);
    expect(isTripInProgress(trip, end)).toBe(false);
    expect(isTripCompleted(trip, end)).toBe(true);
  });

  it('counts down whole days, then reports ongoing and completed', () => {
    expect(tripStatus(trip, start - 6 * DAY - HOUR)).toBe('in 6 days');
    expect(tripStatus(trip, start - 6 * DAY + HOUR)).toBe('in 5 days');
    expect(tripStatus(trip, start + HOUR)).toBe('Ongoing');
    expect(tripStatus(trip, end)).toBe('Completed');
  });

  it('reports the calendar day of the trip and the elapsed share', () => {
    expect(tripProgress(trip, start + HOUR)).toMatchObject({ day: 1, totalDays: 9 });
    expect(tripProgress(trip, new Date(2030, 5, 4, 9, 0).getTime())).toMatchObject({ day: 3 });
    expect(tripProgress(trip, end + DAY)).toEqual({ day: 9, totalDays: 9, percent: 100 });
  });

  it('counts the calendar days between two trips', () => {
    const later: Trip = { ...trip, id: 'later', from: new Date(2030, 5, 20, 6, 0), to: new Date(2030, 5, 25) };
    expect(daysBetweenTrips(trip, later)).toBe(10);
  });
});
