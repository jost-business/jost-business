import { test as base, type Route } from '@playwright/test';
import type { TripDto } from '@jost/models';

/** "Now" for every test, so statuses like "in 31 days" never drift. */
export const NOW = new Date('2030-05-01T12:00:00.000Z');

const trip = (id: string, destination: string, startsAt: string, endsAt: string, photos: string[] = []): TripDto => ({
  id,
  destination,
  startsAt,
  endsAt,
  photos,
});

export const TRIPS: TripDto[] = [
  trip('2030-06-morocco', 'Casablanca, Morocco', '2030-06-02T10:00:00.000Z', '2030-06-10T10:00:00.000Z'),
  trip('2030-03-peru', 'Lima, Peru', '2030-03-01T10:00:00.000Z', '2030-03-08T10:00:00.000Z'),
  trip('2025-10-turkey', 'Alanya, Turkey', '2025-10-01T08:00:00.000Z', '2025-10-12T18:00:00.000Z', [
    'alanya.jpeg',
    'alanya_cable_car.jpeg',
    'alanya_love.jpeg',
  ]),
];

type Fixtures = {
  /** Replace to make the API answer differently, e.g. fail first. */
  tripsApi: (route: Route) => Promise<void>;
};

/**
 * The app talks to the real dev server, but the API is answered here: the
 * tests need no database and always see the same trips.
 */
export const test = base.extend<Fixtures>({
  // Playwright reads the first parameter to see which fixtures this one needs: none
  // eslint-disable-next-line no-empty-pattern
  tripsApi: async ({}, use) => {
    await use(route => route.fulfill({ json: TRIPS }));
  },
  page: async ({ page, tripsApi }, use) => {
    await page.clock.setFixedTime(NOW);
    await page.route('**/api/trips', route => tripsApi(route));
    // Nobody is logged in unless a test says otherwise
    await page.route('**/api/auth/session', route => route.fulfill({ json: { user: null } }));
    await use(page);
  },
});

export { expect } from '@playwright/test';
