import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { TripDto } from '@jost/models';
import { TRAVEL_ROUTES } from './travel.routes';
import { TripDetailRouteComponent } from './trip-detail-route.component';

const trip = (id: string, destination: string, photos: string[] = []): TripDto => ({
  id,
  destination,
  startsAt: '2025-10-01T08:00:00.000Z',
  endsAt: '2025-10-10T18:00:00.000Z',
  photos,
});

const TRIPS: TripDto[] = [
  trip('2025-10-turkey', 'Istanbul, Turkey', ['1.jpg', '2.jpg']),
  trip('2024-05-morocco', 'Casablanca, Morocco'),
  trip('2023-08-peru', 'Lima, Peru'),
];

describe('travel routes', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TRAVEL_ROUTES, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  /** Navigates, answers the trips request once it is made, and waits for the page to settle. */
  async function open(url: string): Promise<HTMLElement> {
    await harness.navigateByUrl(url);
    for (const request of http.match('/api/trips')) request.flush(TRIPS);
    await harness.fixture.whenStable();
    return harness.routeNativeElement as HTMLElement;
  }

  const title = (page: HTMLElement) => page.querySelector('h2')?.textContent?.trim();

  it('shows the trip named in the URL', async () => {
    const page = await open('/trip/2024-05-morocco');

    expect(title(page)).toBe('Casablanca, Morocco');
  });

  it('follows the URL when the router reuses the page for another trip', async () => {
    await open('/trip/2024-05-morocco');
    const before = harness.fixture.debugElement.query(el => el.componentInstance instanceof TripDetailRouteComponent);

    const page = await open('/trip/2023-08-peru');
    const after = harness.fixture.debugElement.query(el => el.componentInstance instanceof TripDetailRouteComponent);

    // Same component instance, new input value: a snapshot read would still show Morocco
    expect(after.componentInstance).toBe(before.componentInstance);
    expect(title(page)).toBe('Lima, Peru');
  });

  it('binds static route data to the same input, with the trip page content as a child', async () => {
    const page = await open('/trip/2025-10-turkey');

    expect(title(page)).toBe('Istanbul, Turkey');
    expect(page.textContent).toContain('Road Trip');
  });

  it('says so when no trip has the id', async () => {
    const page = await open('/trip/nowhere');

    expect(page.textContent).toContain('Trip not found.');
  });

  it('loads the deferred photo gallery once its placeholder is in view', async () => {
    const page = await open('/trip/2025-10-turkey');
    const placeholder = page.querySelector('.gallery-placeholder');
    placeholder?.scrollIntoView();

    // The viewport trigger is a real IntersectionObserver in the browser; wait for it and the chunk
    await vi.waitFor(async () => {
      await harness.fixture.whenStable();
      expect(page.querySelectorAll('.gallery-item')).toHaveLength(2);
    });
  });
});
