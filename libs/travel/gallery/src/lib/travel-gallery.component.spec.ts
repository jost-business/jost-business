import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { page, userEvent } from 'vitest/browser';
import type { TripDto } from '@jost/models';
import { TravelGalleryComponent } from './travel-gallery.component';

const trip = (id: string, destination: string, startsAt: string, endsAt: string, photos: string[]): TripDto => ({
  id,
  destination,
  startsAt,
  endsAt,
  photos,
});

const TRIPS: TripDto[] = [
  trip('2030-06-morocco', 'Casablanca, Morocco', '2030-06-02T10:00:00.000Z', '2030-06-10T10:00:00.000Z', []),
  trip('2030-03-peru', 'Lima, Peru', '2030-03-01T10:00:00.000Z', '2030-03-08T10:00:00.000Z', ['a.jpg', 'b.jpg']),
  trip('2029-12-turkey', 'Istanbul, Turkey', '2029-12-20T10:00:00.000Z', '2030-01-03T10:00:00.000Z', ['c.jpg']),
];

describe('TravelGalleryComponent', () => {
  let fixture: ComponentFixture<TravelGalleryComponent>;
  let http: HttpTestingController;
  let changes: (string | undefined)[];

  /** Shows the gallery for a trip (or all trips) once the trips have loaded. */
  async function open(tripId?: string, editable = false): Promise<void> {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(TravelGalleryComponent);
    fixture.componentRef.setInput('tripId', tripId);
    fixture.componentRef.setInput('editable', editable);
    changes = [];
    fixture.componentInstance.tripChange.subscribe(id => changes.push(id));
    fixture.autoDetectChanges();
    http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/trips').flush(TRIPS);
    await fixture.whenStable();
  }

  /** Waits for the app to send the request, then hands it over. */
  const nextRequest = (method: string, url: string) =>
    vi.waitFor(() => {
      const [request] = http.match(r => r.method === method && r.url === url);
      if (!request) throw new Error(`No ${method} ${url} yet`);
      return request;
    });

  const withPhotos = (dto: TripDto, photos: string[]): TripDto => ({ ...dto, photos });

  const filter = (name: string | RegExp) => page.getByRole('group', { name: 'Show photos of' }).getByRole('button', { name });
  const photos = () => page.getByRole('button', { name: /Open photo/ });

  it('has a filter for every trip with photos, named by city and month', async () => {
    await open();

    const names = filter(/./).elements().map(button => button.textContent?.trim());
    expect(names).toEqual(['All', 'Lima March 2030', 'Istanbul December 2029']);
    await expect.element(filter('All')).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows every trip with its own heading when nothing is selected', async () => {
    await open();

    await expect.element(page.getByRole('heading', { name: 'Lima March 2030' })).toBeVisible();
    await expect.element(page.getByRole('heading', { name: 'Istanbul December 2029' })).toBeVisible();
    expect(photos().elements()).toHaveLength(3);
  });

  it('starts with the trip from the URL selected, its details above its photos', async () => {
    await open('2030-03-peru');

    await expect.element(filter('Lima March 2030')).toHaveAttribute('aria-pressed', 'true');
    await expect.element(filter('All')).toHaveAttribute('aria-pressed', 'false');
    await expect.element(page.getByRole('heading', { name: 'Lima, Peru' })).toBeVisible();
    expect(photos().elements()).toHaveLength(2);
    await expect.element(page.getByRole('heading', { name: 'Istanbul December 2029' })).not.toBeInTheDocument();
  });

  it('reports which filter was clicked; the page decides what is selected', async () => {
    await open('2030-03-peru');

    await filter('Istanbul December 2029').click();
    await filter('All').click();

    expect(changes).toEqual(['2029-12-turkey', undefined]);
  });

  it('shows the details of a trip without photos and says there are none', async () => {
    await open('2030-06-morocco');

    await expect.element(page.getByRole('heading', { name: 'Casablanca, Morocco' })).toBeVisible();
    await expect.element(page.getByText('There are no photos of this trip yet.')).toBeVisible();
  });

  it('says so when no trip has the id', async () => {
    await open('nowhere');

    await expect.element(page.getByText('Trip not found.')).toBeVisible();
  });

  describe('for a logged-in user', () => {
    const peru = TRIPS[1];
    const image = (name: string) => new File(['not really an image'], name, { type: 'image/jpeg' });

    it('offers no upload to visitors', async () => {
      await open('2030-03-peru');

      await expect.element(page.getByRole('heading', { name: 'Lima, Peru' })).toBeVisible();
      expect(page.getByLabelText(/Add photos/).elements()).toHaveLength(0);
      expect(page.getByRole('button', { name: /Delete photo/ }).elements()).toHaveLength(0);
    });

    it('uploads photos one after the other and shows each as soon as it is there', async () => {
      await open('2030-03-peru', true);

      await userEvent.upload(page.getByLabelText(/Add photos/), [image('one.jpg'), image('two.jpg')]);

      const first = await nextRequest('POST', '/api/trips/2030-03-peru/photos');
      expect((first.request.body as FormData).get('photo')).toBeInstanceOf(File);
      await expect.element(page.getByText('Uploading photo 1 of 2…')).toBeVisible();
      // The second photo waits until the first is done
      expect(http.match(r => r.method === 'POST').length).toBe(0);
      first.flush(withPhotos(peru, [...peru.photos, 'x1.webp']), { status: 201, statusText: 'Created' });
      await vi.waitFor(() => expect(photos().elements()).toHaveLength(3));

      const second = await nextRequest('POST', '/api/trips/2030-03-peru/photos');
      await expect.element(page.getByText('Uploading photo 2 of 2…')).toBeVisible();
      second.flush(withPhotos(peru, [...peru.photos, 'x1.webp', 'x2.webp']), { status: 201, statusText: 'Created' });

      await vi.waitFor(() => expect(photos().elements()).toHaveLength(4));
      await expect.element(page.getByText(/Add photos/)).toBeVisible();
    });

    it('goes on with the next photo when one fails, and says which one', async () => {
      await open('2030-03-peru', true);

      await userEvent.upload(page.getByLabelText(/Add photos/), [image('broken.jpg'), image('fine.jpg')]);

      (await nextRequest('POST', '/api/trips/2030-03-peru/photos')).flush(null, {
        status: 415,
        statusText: 'Unsupported Media Type',
      });
      (await nextRequest('POST', '/api/trips/2030-03-peru/photos')).flush(
        withPhotos(peru, [...peru.photos, 'fine.webp']),
        { status: 201, statusText: 'Created' },
      );

      await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('broken.jpg: this is not an image the server can read.');
      await vi.waitFor(() => expect(photos().elements()).toHaveLength(3));
    });

    it('deletes a photo after asking', async () => {
      await open('2030-03-peru', true);
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

      await page.getByRole('button', { name: 'Delete photo 1' }).click();

      expect(confirm).toHaveBeenCalled();
      (await nextRequest('DELETE', '/api/trips/2030-03-peru/photos/a.jpg')).flush(withPhotos(peru, ['b.jpg']));
      await vi.waitFor(() => expect(photos().elements()).toHaveLength(1));
      confirm.mockRestore();
    });

    it('keeps the photo when the question is answered with no', async () => {
      await open('2030-03-peru', true);
      const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

      await page.getByRole('button', { name: 'Delete photo 1' }).click();

      http.expectNone(r => r.method === 'DELETE');
      expect(photos().elements()).toHaveLength(2);
      confirm.mockRestore();
    });
  });
});
