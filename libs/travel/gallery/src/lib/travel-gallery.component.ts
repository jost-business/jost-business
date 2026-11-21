import { Component, computed, DestroyRef, inject, Injector, input, LOCALE_ID, output, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import type { Photo, Trip } from '@jost/models';
import { AuthStore, TripsStore, tripCity } from '@jost/shared';
import { PhotoGalleryComponent, TripDetailCardComponent } from '@jost/travel/ui';

/**
 * Whether a dropped file is a photo. iPhone photos (.heic) often come without
 * a type on Windows, so the extension counts too.
 */
function isImage(file: File): boolean {
  return file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name);
}

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
 *
 * With `editable` (a logged-in user) a selected trip also takes new photos
 * and offers to delete its photos.
 */
@Component({
  selector: 'jost-travel-gallery',
  imports: [PhotoGalleryComponent, TripDetailCardComponent],
  templateUrl: './travel-gallery.component.html',
  styleUrl: './travel-gallery.component.scss',
})
export class TravelGalleryComponent {
  protected readonly store = inject(TripsStore);
  private readonly injector = inject(Injector);
  private readonly locale = inject(LOCALE_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** The selected trip; without one every trip is shown. */
  readonly tripId = input<string>();
  /** Lets the user add and delete photos of the selected trip. */
  readonly editable = input(false);
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

  /** While uploading: how many of how many photos are done. */
  protected readonly upload = signal<{ done: number; total: number } | null>(null);
  protected readonly uploadText = computed(() => {
    const progress = this.upload();
    return progress && `Uploading photo ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`;
  });
  /** What went wrong with the last upload or delete, one line per photo. */
  protected readonly problems = signal<string[]>([]);
  protected readonly dragging = signal(false);

  protected filesChosen(input: HTMLInputElement): void {
    this.addPhotos([...(input.files ?? [])]);
    input.value = ''; // so choosing the same file again fires change again
  }

  protected dropped(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.addPhotos([...(event.dataTransfer?.files ?? [])].filter(isImage));
  }

  /**
   * Uploads the photos one after the other: each appears as soon as it is
   * done, and one that fails does not stop the others.
   */
  private addPhotos(files: File[]): void {
    const trip = this.selectedTrip();
    if (!trip || !files.length || this.upload()) return;
    this.problems.set([]);
    this.upload.set({ done: 0, total: files.length });
    from(files)
      .pipe(
        concatMap(file =>
          this.store.uploadPhoto(trip.id, file).pipe(
            catchError((error: unknown) => {
              this.report(`${file.name}: ${this.describe(error)}`, error);
              return EMPTY;
            }),
            finalize(() => this.upload.update(state => state && { ...state, done: state.done + 1 })),
          ),
        ),
        finalize(() => this.upload.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected deletePhoto(trip: Trip, photo: Photo): void {
    if (!confirm('Delete this photo? This cannot be undone.')) return;
    this.problems.set([]);
    this.store
      .deletePhoto(trip.id, photo.name)
      .pipe(
        tap({ error: (error: unknown) => this.report(`The photo could not be deleted: ${this.describe(error)}`, error) }),
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  /** Shows the new order at once; the store puts the old one back if saving fails. */
  protected reorder(trip: Trip, photos: Photo[]): void {
    this.problems.set([]);
    this.store
      .reorderPhotos(trip.id, photos.map(photo => photo.name))
      .pipe(
        tap({ error: (error: unknown) => this.report(`The new order could not be saved: ${this.describe(error)}`, error) }),
        catchError(() => EMPTY),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private report(problem: string, error: unknown): void {
    this.problems.update(problems => [...problems, problem]);
    // Only needed here; asking for it up front would ask the API for the session on every visit
    if (error instanceof HttpErrorResponse && error.status === 401) this.injector.get(AuthStore).sessionEnded();
  }

  private describe(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) return 'something went wrong.';
    switch (error.status) {
      case 401:
        return 'your session has ended, please log in again.';
      case 413:
        return 'the file is too large (at most 25 MB).';
      case 409:
        return 'the photos have changed in the meantime, please reload the page.';
      case 415:
        return 'this is not an image the server can read.';
      case 0:
        return 'no connection to the server.';
      default:
        return 'something went wrong, please try again.';
    }
  }
}
