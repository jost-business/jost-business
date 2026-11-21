import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { page } from 'vitest/browser';
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
  let changes: (string | undefined)[];

  /** Shows the gallery for a trip (or all trips) once the trips have loaded. */
  async function open(tripId?: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    fixture = TestBed.createComponent(TravelGalleryComponent);
    fixture.componentRef.setInput('tripId', tripId);
    changes = [];
    fixture.componentInstance.tripChange.subscribe(id => changes.push(id));
    fixture.autoDetectChanges();
    TestBed.inject(HttpTestingController).expectOne('/api/trips').flush(TRIPS);
    await fixture.whenStable();
  }

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
});
