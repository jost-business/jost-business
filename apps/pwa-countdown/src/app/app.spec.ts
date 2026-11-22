import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { TripDto } from '@jost/models';
import { App } from './app';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Fixed trips, so the tests do not depend on the real travel plans
const PAST: TripDto = {
  id: 'past',
  destination: 'Lisbon, Portugal',
  startsAt: '2030-01-01T10:00:00.000Z',
  endsAt: '2030-01-10T10:00:00.000Z',
  photos: [],
  photoLabels: {},
  labelOrder: [],
};
const NEXT: TripDto = {
  id: 'next',
  destination: 'Casablanca, Morocco',
  startsAt: '2030-06-02T10:00:00.000Z',
  endsAt: '2030-06-10T10:00:00.000Z',
  photos: [],
  photoLabels: {},
  labelOrder: [],
};
const TRIPS = [NEXT, PAST];
const nextStart = Date.parse(NEXT.startsAt);

describe('App', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    vi.useFakeTimers();
    // The testing backend answers every request the app makes
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /** Creates the app at the given time, without answering the trips request yet. */
  function create(now: number): ComponentFixture<App> {
    vi.setSystemTime(now);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return fixture;
  }

  /**
   * Lets the resource take in the response and renders the result. Advances by
   * zero rather than running pending timers: those include the clock's wake-up
   * at the next trip boundary, which would silently jump the time forward.
   */
  async function settle(fixture: ComponentFixture<App>): Promise<HTMLElement> {
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  async function render(now: number): Promise<HTMLElement> {
    const fixture = create(now);
    http.expectOne('/api/trips').flush(TRIPS);
    return settle(fixture);
  }

  it('shows the countdown before the next trip starts', async () => {
    const el = await render(nextStart - DAY);

    expect(el.querySelector('h1')?.textContent).toContain('Casablanca');
    expect(el.querySelector('lib-romantic-countdown')).not.toBeNull();
    expect(el.querySelector('lib-together-card')).toBeNull();
  });

  it('shows the together card while a trip is in progress', async () => {
    const el = await render(nextStart + HOUR);

    expect(el.querySelector('lib-together-card')).not.toBeNull();
    expect(el.querySelector('lib-romantic-countdown')).toBeNull();
  });

  it('shows "coming soon" when no trip is planned anymore', async () => {
    const el = await render(Date.parse(NEXT.endsAt) + HOUR);

    expect(el.querySelector('h1')?.textContent).toContain('Coming soon');
    expect(el.querySelector('lib-romantic-countdown')).toBeNull();
    expect(el.querySelector('lib-together-card')).toBeNull();
  });

  it('switches to the together card when the countdown reaches zero', async () => {
    const fixture = create(nextStart - 2000);
    http.expectOne('/api/trips').flush(TRIPS);
    await settle(fixture);

    vi.advanceTimersByTime(3000);
    const el = await settle(fixture);

    expect(el.querySelector('lib-together-card')).not.toBeNull();
  });

  it('catches up when it comes back from the background after the trip started', async () => {
    const fixture = create(nextStart - 2 * DAY);
    http.expectOne('/api/trips').flush(TRIPS);
    await settle(fixture);

    // Time passes while the app is hidden, without any timer firing
    vi.setSystemTime(nextStart + HOUR);
    document.dispatchEvent(new Event('visibilitychange'));
    const el = await settle(fixture);

    expect(el.querySelector('lib-together-card')).not.toBeNull();
  });

  it('shows a loading state instead of "coming soon" while the trips are on their way', async () => {
    const fixture = create(nextStart - DAY);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(el.textContent).not.toContain('Coming soon');
    http.expectOne('/api/trips').flush(TRIPS);
  });

  it('offers a retry when the trips cannot be loaded, and loads them again', async () => {
    const fixture = create(nextStart - DAY);
    http.expectOne('/api/trips').flush('down', { status: 503, statusText: 'Service Unavailable' });
    let el = await settle(fixture);

    expect(el.querySelector('h1')?.textContent).toContain('No connection');

    el.querySelector<HTMLButtonElement>('.retry-button')?.click();
    await settle(fixture);
    http.expectOne('/api/trips').flush(TRIPS);
    el = await settle(fixture);

    expect(el.querySelector('lib-romantic-countdown')).not.toBeNull();
  });

  it('reports the app open to the API once', async () => {
    create(nextStart - DAY);

    const request = http.expectOne('/api/pwa/notification');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ event: 'app_open' });
  });
});
