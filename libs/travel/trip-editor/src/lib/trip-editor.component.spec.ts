import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { page } from 'vitest/browser';
import type { Trip, TripDto } from '@jost/models';
import { TripEditorComponent } from './trip-editor.component';

const LISBON: TripDto = {
  id: '2027-03-lisbon',
  destination: 'Lisbon, Portugal',
  startsAt: new Date(2027, 2, 1, 10, 0).toISOString(),
  endsAt: new Date(2027, 2, 8, 18, 30).toISOString(),
  photos: [],
  photoLabels: {},
  labelOrder: [],
};

describe('TripEditorComponent', () => {
  let http: HttpTestingController;
  let saved: Trip[];

  function render(trip?: Trip) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(TripEditorComponent);
    if (trip) fixture.componentRef.setInput('trip', trip);
    saved = [];
    fixture.componentInstance.saved.subscribe(t => saved.push(t));
    fixture.autoDetectChanges();
  }

  /** Waits until the component has sent a matching request, then returns it. */
  async function nextRequest(method: string, url: string | RegExp): Promise<TestRequest> {
    let request: TestRequest | undefined;
    await vi.waitFor(() => {
      [request] = http.match(
        r => r.method === method && (typeof url === 'string' ? r.urlWithParams === url : url.test(r.urlWithParams)),
      );
      expect(request).toBeDefined();
    });
    return request as TestRequest;
  }

  const field = (name: string) => page.getByLabelText(name);
  // Clicking somewhere else leaves the field. Tab would not: in a datetime-local
  // input it moves between the day, month, year and time parts
  const leaveField = () => page.getByRole('heading').click();

  async function fillValidTrip(id = '2027-03-lisbon') {
    await field('Id').fill(id);
    await field('Destination').fill('Lisbon, Portugal');
    await field('Departure').fill('2027-03-01T10:00');
    await field('Return').fill('2027-03-08T18:30');
  }

  it('explains what is wrong once a field has been left', async () => {
    render();

    await field('Id').fill('Lisbon Trip');
    await leaveField();

    await expect.element(page.getByText(/^Lower-case letters and digits/)).toBeVisible();
    await field('Destination').click();
    await leaveField();
    await expect.element(page.getByText('Where does the trip go?')).toBeVisible();
  });

  it('checks with the API whether the id is free, while typing', async () => {
    render();

    await field('Id').fill('2025-10-turkey');
    await leaveField();
    (await nextRequest('GET', '/api/trips/availability?id=2025-10-turkey')).flush({ available: false });

    await expect.element(page.getByText('There already is a trip with this id.')).toBeVisible();
  });

  it('wants the return after the departure', async () => {
    render();

    await field('Departure').fill('2027-03-08T10:00');
    await field('Return').fill('2027-03-01T10:00');
    await leaveField();

    await expect.element(page.getByText('The trip must end after it starts.')).toBeVisible();
  });

  it('does not send anything while the form is invalid', async () => {
    render();

    await page.getByRole('button', { name: 'Create trip' }).click();

    // Submitting marks every field as touched, so all problems show at once
    await expect.element(page.getByText('Give the trip an id.')).toBeVisible();
    await expect.element(page.getByText('When does it end?')).toBeVisible();
    http.expectNone(r => r.method === 'POST');
  });

  it('creates the trip with the times as ISO instants', async () => {
    render();
    await fillValidTrip();
    (await nextRequest('GET', /availability/)).flush({ available: true });

    await page.getByRole('button', { name: 'Create trip' }).click();
    const post = await nextRequest('POST', '/api/trips');

    expect(post.request.body).toEqual({
      id: '2027-03-lisbon',
      destination: 'Lisbon, Portugal',
      startsAt: LISBON.startsAt,
      endsAt: LISBON.endsAt,
    });
    post.flush(LISBON);
    await vi.waitFor(() => expect(saved.map(t => t.id)).toEqual(['2027-03-lisbon']));
  });

  it('shows a conflict from the server on the id field', async () => {
    render();
    await fillValidTrip();
    (await nextRequest('GET', /availability/)).flush({ available: true });

    await page.getByRole('button', { name: 'Create trip' }).click();
    (await nextRequest('POST', '/api/trips')).flush('taken', { status: 409, statusText: 'Conflict' });

    await expect.element(page.getByText('There already is a trip with this id.')).toBeVisible();
    expect(saved).toEqual([]);
  });

  it('edits an existing trip without touching its id', async () => {
    render({
      id: LISBON.id,
      destination: LISBON.destination,
      from: new Date(LISBON.startsAt),
      to: new Date(LISBON.endsAt),
      photos: [],
      labelOrder: [],
    });

    await expect.element(field('Id')).toHaveValue('2027-03-lisbon');
    await expect.element(field('Id')).toHaveAttribute('readonly');
    await expect.element(field('Departure')).toHaveValue('2027-03-01T10:00');

    await field('Destination').fill('Lisbon & Sintra, Portugal');
    await page.getByRole('button', { name: 'Save changes' }).click();
    const put = await nextRequest('PUT', '/api/trips/2027-03-lisbon');

    expect(put.request.body).toMatchObject({ destination: 'Lisbon & Sintra, Portugal' });
    // No availability check for an id that already belongs to this trip
    http.expectNone(r => r.url.includes('availability'));
    put.flush({ ...LISBON, destination: 'Lisbon & Sintra, Portugal' });
    await vi.waitFor(() => expect(saved[0]?.destination).toBe('Lisbon & Sintra, Portugal'));
  });
});
