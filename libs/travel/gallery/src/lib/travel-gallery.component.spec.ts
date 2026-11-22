import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { page, userEvent } from 'vitest/browser';
import { By } from '@angular/platform-browser';
import type { Photo, TripDto } from '@jost/models';
import { PhotoGalleryComponent } from '@jost/travel/ui';
import { TravelGalleryComponent } from './travel-gallery.component';

const trip = (id: string, destination: string, startsAt: string, endsAt: string, photos: string[]): TripDto => ({
  id,
  destination,
  startsAt,
  endsAt,
  photos,
  photoLabels: {},
  labelOrder: [],
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
  async function open(tripId?: string, editable = false, label?: string, trips: TripDto[] = TRIPS): Promise<void> {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(TravelGalleryComponent);
    fixture.componentRef.setInput('tripId', tripId);
    fixture.componentRef.setInput('editable', editable);
    fixture.componentRef.setInput('label', label);
    changes = [];
    fixture.componentInstance.tripChange.subscribe(id => changes.push(id));
    fixture.autoDetectChanges();
    http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/trips').flush(trips);
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

    describe('changing the order', () => {
      const photoSources = () =>
        [...document.querySelectorAll<HTMLImageElement>('.gallery-image')].map(img => img.getAttribute('src'));

      /** What the photo gallery reports after a photo was dragged to a new place. */
      function dragged(names: string[]): void {
        const gallery = fixture.debugElement.query(By.directive(PhotoGalleryComponent)).componentInstance as PhotoGalleryComponent;
        const byName = new Map(gallery.trip().photos.map(photo => [photo.name, photo]));
        gallery.reordered.emit(names.map(name => byName.get(name) as Photo));
      }

      it('shows the new order at once and saves it', async () => {
        await open('2030-03-peru', true);
        await expect.element(page.getByText('Drag the photos to change their order.')).toBeVisible();

        dragged(['b.jpg', 'a.jpg']);

        await vi.waitFor(() => expect(photoSources()).toEqual([expect.stringContaining('b.jpg'), expect.stringContaining('a.jpg')]));
        const request = await nextRequest('PUT', '/api/trips/2030-03-peru/photos');
        expect(request.request.body).toEqual({ photos: ['b.jpg', 'a.jpg'] });
        request.flush(withPhotos(peru, ['b.jpg', 'a.jpg']));
        await fixture.whenStable();
        expect(page.getByRole('alert').elements()).toHaveLength(0);
      });

      it('goes back to the old order when it cannot be saved', async () => {
        await open('2030-03-peru', true);

        dragged(['b.jpg', 'a.jpg']);
        (await nextRequest('PUT', '/api/trips/2030-03-peru/photos')).flush(null, { status: 409, statusText: 'Conflict' });

        await expect.element(page.getByText(/^The new order could not be saved/)).toBeVisible();
        expect(photoSources()).toEqual([expect.stringContaining('a.jpg'), expect.stringContaining('b.jpg')]);
      });
    });
  });

  describe('photo labels', () => {
    const peru = TRIPS[1];
    // Three photos, two of them at the Dakhla Club and one also at the beach
    const labelled: TripDto = {
      ...peru,
      photos: ['a.jpg', 'b.jpg', 'c2.jpg'],
      photoLabels: { 'a.jpg': ['Beach', 'Dakhla Club'], 'b.jpg': ['Dakhla Club'] },
    };
    const trips = [TRIPS[0], labelled, TRIPS[2]];
    let labels: (string | undefined)[];

    async function openLabelled(editable: boolean, label?: string): Promise<void> {
      await open('2030-03-peru', editable, label, trips);
      labels = [];
      fixture.componentInstance.labelChange.subscribe(l => labels.push(l));
    }

    const labelFilter = (name: string | RegExp) =>
      page.getByRole('group', { name: 'Show photos labelled' }).getByRole('button', { name });

    it('has a filter per label of the trip with how many photos have it', async () => {
      await openLabelled(false);

      await expect.element(labelFilter('All photos')).toHaveAttribute('aria-pressed', 'true');
      await expect.element(labelFilter('Beach 1')).toBeVisible();
      await expect.element(labelFilter('Dakhla Club 2')).toBeVisible();
      // All photos come in a section per label, A to Z, and the rest at the end; a.jpg has two labels
      const sectionTitles = [...document.querySelectorAll('h4')].map(h => h.textContent?.replace(/\s+/g, ' ').trim());
      expect(sectionTitles).toEqual(['Beach 1', 'Dakhla Club 2', 'Without label 1']);
      expect(photos().elements()).toHaveLength(4);

      await labelFilter(/Dakhla Club/).click();
      expect(labels).toEqual(['Dakhla Club']);
    });

    it('shows only the photos with the label from the URL', async () => {
      await openLabelled(false, 'Dakhla Club');

      await expect.element(labelFilter(/Dakhla Club/)).toHaveAttribute('aria-pressed', 'true');
      expect(photos().elements()).toHaveLength(2);
    });

    it('shows all photos for a label the trip does not have', async () => {
      await openLabelled(false, 'Oasis 212');

      await expect.element(labelFilter('All photos')).toHaveAttribute('aria-pressed', 'true');
      expect(photos().elements()).toHaveLength(4);
    });

    it('has no label filter for all trips or a trip without labels', async () => {
      await open(undefined, false, undefined, trips);
      await expect.element(page.getByRole('heading', { name: 'Lima March 2030' })).toBeVisible();
      expect(page.getByRole('group', { name: 'Show photos labelled' }).elements()).toHaveLength(0);
    });

    it('gives the marked photos a label, suggesting the labels the trip has', async () => {
      await openLabelled(true);
      await page.getByRole('button', { name: 'Select photos' }).click();

      await page.getByRole('button', { name: 'Select photo 2' }).click();
      // The third "photo 1" is c2.jpg, the first in "Without label"
      await page.getByRole('button', { name: 'Select photo 1' }).nth(2).click();
      await expect.element(page.getByText('2 marked')).toBeVisible();
      const suggestions = [...document.querySelectorAll<HTMLOptionElement>('#trip-labels option')].map(o => o.value);
      expect(suggestions).toEqual(['Beach', 'Dakhla Club']);

      await page.getByRole('combobox', { name: 'Label' }).fill('  Oasis 212 ');
      await page.getByRole('button', { name: 'Add label' }).click();

      const request = await nextRequest('PATCH', '/api/trips/2030-03-peru/photo-labels');
      expect(request.request.body).toEqual({ label: 'Oasis 212', add: ['b.jpg', 'c2.jpg'] });
      request.flush({ ...labelled, photoLabels: { ...labelled.photoLabels, 'b.jpg': ['Dakhla Club', 'Oasis 212'], 'c2.jpg': ['Oasis 212'] } });

      await expect.element(labelFilter('Oasis 212 2')).toBeVisible();
      // The field empties for the next label, the marks stay
      await expect.element(page.getByRole('combobox', { name: 'Label' })).toHaveValue('');
      await expect.element(page.getByText('2 marked')).toBeVisible();
    });

    it('takes a label off the marked photos that have it', async () => {
      await openLabelled(true);
      await page.getByRole('button', { name: 'Select photos' }).click();
      await page.getByRole('button', { name: 'Mark all' }).click();

      await page.getByRole('button', { name: 'Remove label Dakhla Club' }).click();

      const request = await nextRequest('PATCH', '/api/trips/2030-03-peru/photo-labels');
      expect(request.request.body).toEqual({ label: 'Dakhla Club', remove: ['a.jpg', 'b.jpg'] });
      request.flush({ ...labelled, photoLabels: { 'a.jpg': ['Beach'] } });
      await vi.waitFor(() => expect(labelFilter(/Dakhla Club/).elements()).toHaveLength(0));
    });

    it('says so when a label cannot be saved', async () => {
      await openLabelled(true);
      await page.getByRole('button', { name: 'Select photos' }).click();
      await page.getByRole('button', { name: 'Select photo 1' }).first().click();
      await page.getByRole('combobox', { name: 'Label' }).fill('Oasis 212');
      await page.getByRole('button', { name: 'Add label' }).click();

      (await nextRequest('PATCH', '/api/trips/2030-03-peru/photo-labels')).flush(null, { status: 500, statusText: 'Error' });

      await expect.element(page.getByText(/^The label could not be saved/)).toBeVisible();
      await expect.element(page.getByRole('combobox', { name: 'Label' })).toHaveValue('Oasis 212');
    });

    it('sorts a section on its own: its photos swap places, the others stay put', async () => {
      // c2.jpg (no label) sits between the two Dakhla Club photos
      const mixed: TripDto = { ...labelled, photos: ['a.jpg', 'c2.jpg', 'b.jpg'], photoLabels: { 'a.jpg': ['Dakhla Club'], 'b.jpg': ['Dakhla Club'] } };
      await open('2030-03-peru', true, undefined, [TRIPS[0], mixed, TRIPS[2]]);
      await expect.element(page.getByText('Drag the photos to change their order within a label.')).toBeVisible();
      const galleries = fixture.debugElement.queryAll(By.directive(PhotoGalleryComponent)).map(d => d.componentInstance as PhotoGalleryComponent);
      expect(galleries.map(g => g.heading())).toEqual(['Dakhla Club', 'Without label']);
      expect(galleries.every(g => g.sortable())).toBe(true);

      const dakhla = galleries[0];
      dakhla.reordered.emit([...dakhla.trip().photos].reverse());

      const request = await nextRequest('PUT', '/api/trips/2030-03-peru/photos');
      expect(request.request.body).toEqual({ photos: ['b.jpg', 'c2.jpg', 'a.jpg'] });
      request.flush({ ...mixed, photos: ['b.jpg', 'c2.jpg', 'a.jpg'] });
    });

    const sectionTitles = () => [...document.querySelectorAll('h4 .gallery-title-text')].map(h => h.textContent?.trim());
    const filterNames = () =>
      [...document.querySelectorAll('.label-chips .filter-button')].map(b => b.childNodes[0]?.textContent?.trim());

    it('shows the labels in the order the user gave them, new ones after it A to Z', async () => {
      const ordered: TripDto = { ...labelled, photoLabels: { ...labelled.photoLabels, 'c2.jpg': ['Arcade'] }, labelOrder: ['Dakhla Club', 'Gone'] };
      await open('2030-03-peru', false, undefined, [TRIPS[0], ordered, TRIPS[2]]);

      await vi.waitFor(() => expect(sectionTitles()).toEqual(['Dakhla Club', 'Arcade', 'Beach']));
      expect(filterNames()).toEqual(['Dakhla Club', 'Arcade', 'Beach']);
    });

    it('saves a new order of the labels, and goes back to the old one if that fails', async () => {
      await openLabelled(true);
      await expect.element(page.getByText('Drag the labels to change the order of the sections.')).toBeVisible();
      const component = fixture.componentInstance as unknown as { labelDropped(event: { previousIndex: number; currentIndex: number }): void };

      component.labelDropped({ previousIndex: 1, currentIndex: 0 });
      await vi.waitFor(() => expect(sectionTitles()).toEqual(['Dakhla Club', 'Beach', 'Without label']));
      let request = await nextRequest('PUT', '/api/trips/2030-03-peru/label-order');
      expect(request.request.body).toEqual({ labels: ['Dakhla Club', 'Beach'] });
      request.flush({ ...labelled, labelOrder: ['Dakhla Club', 'Beach'] });
      await fixture.whenStable();

      component.labelDropped({ previousIndex: 1, currentIndex: 0 });
      request = await nextRequest('PUT', '/api/trips/2030-03-peru/label-order');
      request.flush(null, { status: 500, statusText: 'Error' });
      await expect.element(page.getByText(/^The order of the labels could not be saved/)).toBeVisible();
      expect(sectionTitles()).toEqual(['Dakhla Club', 'Beach', 'Without label']);
    });

    it('does not let visitors move the labels', async () => {
      await openLabelled(false);
      await expect.element(labelFilter('All photos')).toBeVisible();
      expect(document.querySelector('.label-chips')?.classList).toContain('cdk-drop-list-disabled');
      expect(page.getByText('Drag the labels to change the order of the sections.').elements()).toHaveLength(0);
    });

    it('does not let photos be dragged while only some are shown', async () => {
      await openLabelled(true, 'Dakhla Club');

      await expect.element(page.getByText('Show all photos to change their order.')).toBeVisible();
      expect(document.querySelector('.gallery-grid')?.classList).toContain('cdk-drop-list-disabled');
    });
  });
});
