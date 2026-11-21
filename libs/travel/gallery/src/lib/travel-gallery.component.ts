import { Component, computed, inject, input, LOCALE_ID, output } from '@angular/core';
import { formatDate } from '@angular/common';
import type { Trip } from '@jost/models';
import { TripsStore, tripCity } from '@jost/shared';
import { PhotoGalleryComponent, TripDetailCardComponent } from '@jost/travel/ui';

interface Album {
  trip: Trip;
  /** Short name for the filter, like "Casablanca October 2026". */
  label: string;
}

/**
 * Every photo of every trip, with a filter per trip. The filter only shows
 * trips that have photos, so a new trip appears once it has some.
 *
 * Which trip is selected comes in as an input and changes go out as an
 * output: the page around it keeps the selection in the URL.
 */
@Component({
  selector: 'jost-travel-gallery',
  imports: [PhotoGalleryComponent, TripDetailCardComponent],
  templateUrl: './travel-gallery.component.html',
  styleUrl: './travel-gallery.component.scss',
})
export class TravelGalleryComponent {
  protected readonly store = inject(TripsStore);
  private readonly locale = inject(LOCALE_ID);

  /** The selected trip; without one every trip is shown. */
  readonly tripId = input<string>();
  /** A filter button was clicked; undefined for "All". */
  readonly tripChange = output<string | undefined>();

  /** Trips with photos, newest first like the store. */
  protected readonly albums = computed<Album[]>(() =>
    this.store
      .trips()
      .filter(trip => trip.photos.length > 0)
      .map(trip => ({ trip, label: `${tripCity(trip)} ${formatDate(trip.from, 'MMMM y', this.locale)}` })),
  );

  protected readonly selectedTrip = computed(() => {
    const id = this.tripId();
    return id ? this.store.tripById(id) : undefined;
  });
}
