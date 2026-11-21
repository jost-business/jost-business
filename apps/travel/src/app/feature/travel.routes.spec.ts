import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { TripDto } from '@jost/models';
import { LOGIN_PAGE } from '@jost/shared';
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

  /**
   * Navigates, answers the trips and session requests once they are made, and
   * waits for the page to settle. Open requests count as pending work, so
   * whenStable() would wait for them forever.
   */
  async function open(url: string): Promise<HTMLElement> {
    await harness.navigateByUrl(url);
    for (const request of http.match('/api/trips')) request.flush(TRIPS);
    for (const request of http.match('/api/auth/session')) request.flush({ user: null });
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

describe('editing trips', () => {
  const USER = { id: 'u1', email: 'me@example.com', name: 'Me' };
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(TRAVEL_ROUTES, withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOGIN_PAGE, useValue: { route: '/login' } },
      ],
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  /** Answers a request once the app has made it. match() takes the request off the queue, so it is kept. */
  async function answer(method: string, url: string, body: object): Promise<void> {
    const request = await vi.waitFor(() => {
      const [found] = http.match(r => r.method === method && r.url === url);
      if (!found) throw new Error(`No ${method} ${url} yet`);
      return found;
    });
    request.flush(body);
  }

  /** Starts a navigation, answers what the guard and the page ask for, and waits for it to finish. */
  async function open(url: string, user: typeof USER | null): Promise<HTMLElement> {
    const navigation = harness.navigateByUrl(url);
    await answer('GET', '/api/auth/session', { user });
    await navigation;
    for (const request of http.match('/api/trips')) request.flush(TRIPS);
    await harness.fixture.whenStable();
    return harness.fixture.nativeElement as HTMLElement;
  }

  const router = () => TestBed.inject(Router);

  it('sends visitors to the login and remembers where they wanted to go', async () => {
    const page = await open('/trips/new', null);

    expect(router().url).toBe('/login?returnUrl=%2Ftrips%2Fnew');
    expect(page.querySelector('h2')?.textContent).toContain('Log in');
  });

  it('opens the editor with the trip for a logged-in user', async () => {
    const page = await open('/trip/2024-05-morocco/edit', USER);

    expect(page.querySelector('h2')?.textContent).toContain('Edit trip');
    expect((page.querySelector('#trip-destination') as HTMLInputElement).value).toBe('Casablanca, Morocco');
  });

  it('goes on to the remembered page after logging in', async () => {
    const page = await open('/login?returnUrl=%2Ftrips%2Fnew', null);
    const input = (selector: string, value: string) => {
      const element = page.querySelector(selector) as HTMLInputElement;
      element.value = value;
      element.dispatchEvent(new Event('input'));
    };
    input('#login-email', 'me@example.com');
    input('#login-password', 'secret password');

    (page.querySelector('button[type=submit]') as HTMLButtonElement).click();
    const login = await vi.waitFor(() => http.expectOne('/api/auth/login'));
    expect(login.request.body).toEqual({ email: 'me@example.com', password: 'secret password' });
    login.flush({ user: USER });

    await vi.waitFor(() => expect(router().url).toBe('/trips/new'));
    // The editor's TripsStore loads the trips; the app is only stable once they are there
    await answer('GET', '/api/trips', TRIPS);
    await harness.fixture.whenStable();
    expect(page.querySelector('h2')?.textContent).toContain('New trip');
  });
});
