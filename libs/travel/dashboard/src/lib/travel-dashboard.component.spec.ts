import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { page, userEvent } from 'vitest/browser';
import type { TripDto } from '@jost/models';
import { TravelDashboardComponent } from './travel-dashboard.component';

const trip = (id: string, destination: string, startsAt: string, endsAt: string): TripDto => ({
  id,
  destination,
  startsAt,
  endsAt,
  photos: [],
  photoLabels: {},
  labelOrder: [],
});

const TRIPS: TripDto[] = [
  trip('2030-jun', 'Casablanca, Morocco', '2030-06-02T10:00:00.000Z', '2030-06-10T10:00:00.000Z'),
  trip('2030-mar', 'Lima, Peru', '2030-03-01T10:00:00.000Z', '2030-03-08T10:00:00.000Z'),
  trip('2029-dec', 'Istanbul, Turkey', '2029-12-20T10:00:00.000Z', '2030-01-03T10:00:00.000Z'),
];

describe('TravelDashboardComponent', () => {
  let http: HttpTestingController;
  let selected: string[];

  beforeEach(() => {
    // Only Date is faked: the store's clock timer may run, but "now" stays in May 2030
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.parse('2030-05-01T12:00:00.000Z'));
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);

    // createComponent attaches the host element to the document, so the page
    // locators below find it like a user would: by role and visible text
    const fixture = TestBed.createComponent(TravelDashboardComponent);
    selected = [];
    fixture.componentInstance.tripSelected.subscribe(id => selected.push(id));
    fixture.autoDetectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const answer = (response: TripDto[]) => http.expectOne('/api/trips').flush(response);
  const rows = () => page.getByRole('row').filter({ hasText: /\d{2}\.\d{2}/ });

  it('lists the trips by year with their status', async () => {
    answer(TRIPS);

    await expect.element(page.getByRole('heading', { name: '2030' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: '2029' })).toBeVisible();
    await expect.element(page.getByRole('row', { name: /Casablanca.*in 31 days/ })).toBeVisible();
    expect(rows().all()).toHaveLength(3);
  });

  it('filters the trips with the button group', async () => {
    answer(TRIPS);
    const all = page.getByRole('button', { name: 'All' });
    const completed = page.getByRole('button', { name: 'Completed' });
    await expect.element(all).toHaveAttribute('aria-pressed', 'true');

    await completed.click();

    await expect.element(completed).toHaveAttribute('aria-pressed', 'true');
    await expect.element(all).toHaveAttribute('aria-pressed', 'false');
    await expect.element(page.getByText('Casablanca, Morocco')).not.toBeInTheDocument();
    expect(rows().all()).toHaveLength(2);

    await page.getByRole('button', { name: 'Upcoming' }).click();
    await expect.element(page.getByText('Lima, Peru')).not.toBeInTheDocument();
    expect(rows().all()).toHaveLength(1);
  });

  it('opens a completed trip by click or keyboard, but not an upcoming one', async () => {
    answer(TRIPS);
    const lima = page.getByRole('row', { name: /Lima/ });
    await expect.element(lima).toBeVisible();

    await lima.click();
    await page.getByRole('row', { name: /Casablanca/ }).click();
    (page.getByRole('row', { name: /Istanbul/ }).element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');

    expect(selected).toEqual(['2030-mar', '2029-dec']);
  });

  it('offers a retry when the trips cannot be loaded', async () => {
    http.expectOne('/api/trips').flush('down', { status: 503, statusText: 'Service Unavailable' });

    await expect.element(page.getByRole('alert').getByText('The trips could not be loaded.')).toBeVisible();
    await page.getByRole('button', { name: 'Try again' }).click();
    answer(TRIPS);

    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    expect(rows().all()).toHaveLength(3);
  });
});

