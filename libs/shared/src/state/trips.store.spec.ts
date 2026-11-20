import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TripDto } from '@jost/models';
import { TripsStore } from './trips.store';

const HOUR = 60 * 60 * 1000;

const trip = (id: string, startsAt: string, endsAt: string): TripDto => ({
  id,
  destination: 'Casablanca, Morocco',
  startsAt,
  endsAt,
  photos: [],
});

// Deliberately not sorted: the store must order them itself
const TRIPS: TripDto[] = [
  trip('2029-dec', '2029-12-20T10:00:00.000Z', '2030-01-03T10:00:00.000Z'),
  trip('2030-jun', '2030-06-02T10:00:00.000Z', '2030-06-10T10:00:00.000Z'),
  trip('2030-mar', '2030-03-01T10:00:00.000Z', '2030-03-08T10:00:00.000Z'),
];
const NOW = Date.parse('2030-05-01T12:00:00.000Z');

describe('TripsStore', () => {
  let store: InstanceType<typeof TripsStore>;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(TripsStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Reads the store once so the resource requests, then answers it. */
  async function load(response: TripDto[] = TRIPS): Promise<void> {
    store.trips();
    TestBed.tick();
    http.expectOne('/api/trips').flush(response);
    await vi.advanceTimersByTimeAsync(0);
  }

  it('is loading and empty until the trips arrive', async () => {
    store.trips();
    TestBed.tick();

    expect(store.isLoading()).toBe(true);
    expect(store.trips()).toEqual([]);

    http.expectOne('/api/trips').flush(TRIPS);
    await vi.advanceTimersByTimeAsync(0);

    expect(store.isLoading()).toBe(false);
    expect(store.trips().map(t => t.id)).toEqual(['2030-jun', '2030-mar', '2029-dec']);
  });

  it('turns the ISO strings from the API into dates', async () => {
    await load();

    expect(store.tripById('2030-mar')?.from).toEqual(new Date('2030-03-01T10:00:00.000Z'));
  });

  it('groups the overview by start year with status and gap to the previous trip', async () => {
    await load();

    const years = store.years();
    expect(years.map(y => y.year)).toEqual([2030, 2029]);
    expect(years[0].rows.map(r => [r.trip.id, r.status, r.completed])).toEqual([
      ['2030-jun', 'in 31 days', false],
      ['2030-mar', 'Completed', true],
    ]);
    expect(years[0].rows[1].daysBetween).toBe(57);
    expect(years[1].rows[0].daysBetween).toBeNull();
  });

  it('filters the overview through its state', async () => {
    await load();

    store.setFilter('upcoming');
    expect(store.filter()).toBe('upcoming');
    expect(store.years().flatMap(y => y.rows.map(r => r.trip.id))).toEqual(['2030-jun']);

    store.setFilter('completed');
    expect(store.years().flatMap(y => y.rows.map(r => r.trip.id))).toEqual(['2030-mar', '2029-dec']);
  });

  it('moves on to the current trip by itself when it starts', async () => {
    await load();
    expect(store.currentTrip()).toBeUndefined();
    expect(store.currentOrNextTrip()?.id).toBe('2030-jun');

    // No reload, no event: the clock's scheduled wake-up does the work
    await vi.advanceTimersByTimeAsync(Date.parse('2030-06-02T10:00:00.000Z') - NOW + HOUR);
    TestBed.tick();

    expect(store.currentTrip()?.id).toBe('2030-jun');
    expect(store.years()[0].rows[0].status).toBe('Ongoing');
  });

  it('reports an error with no trips instead of throwing, and recovers on reload', async () => {
    store.trips();
    TestBed.tick();
    http.expectOne('/api/trips').flush('down', { status: 503, statusText: 'Service Unavailable' });
    await vi.advanceTimersByTimeAsync(0);

    expect(store.error()).toBeTruthy();
    expect(store.trips()).toEqual([]);

    store.reload();
    TestBed.tick();
    http.expectOne('/api/trips').flush(TRIPS);
    await vi.advanceTimersByTimeAsync(0);

    expect(store.error()).toBeUndefined();
    expect(store.trips()).toHaveLength(3);
  });
});
