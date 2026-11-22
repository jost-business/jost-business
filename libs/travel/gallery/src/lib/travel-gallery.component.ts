import { Component, computed, DestroyRef, inject, Injector, input, linkedSignal, LOCALE_ID, output, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, EMPTY, finalize, from, tap } from 'rxjs';
import type { Photo, PhotoLabelChange, Trip } from '@jost/models';
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
  title: string;
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
      .map(trip => ({ trip, title: `${tripCity(trip)} ${formatDate(trip.from, 'MMMM y', this.locale)}` })),
  );

  protected readonly selectedTrip = computed(() => {
    const id = this.tripId();
    return id ? this.store.tripById(id) : undefined;
  });

  /** The selected photo label; only photos with it are shown. */
  readonly label = input<string>();
  /** A label filter button was clicked; undefined for all photos. */
  readonly labelChange = output<string | undefined>();

  /** The labels of the selected trip's photos with how many photos have each, A to Z. */
  protected readonly tripLabels = computed(() => {
    const counts = new Map<string, number>();
    for (const photo of this.selectedTrip()?.photos ?? []) {
      for (const label of photo.labels) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  });

  /** The label filter in effect: one the trip no longer has shows all photos. */
  protected readonly activeLabel = computed(() => {
    const label = this.label();
    return this.tripLabels().some(l => l.name === label) ? label : undefined;
  });

  /** The selected trip with only the photos the label filter lets through. */
  protected readonly shownTrip = computed(() => {
    const trip = this.selectedTrip();
    const label = this.activeLabel();
    return trip && label ? { ...trip, photos: trip.photos.filter(photo => photo.labels.includes(label)) } : trip;
  });

  /** Selection mode for labelling; leaves off when another trip is shown. */
  protected readonly selecting = linkedSignal({ source: this.tripId, computation: () => false });
  /** Names of the marked photos. */
  protected readonly selected = linkedSignal<string | undefined, string[]>({ source: this.tripId, computation: () => [] });
  /** The marked photos that are shown; marks hidden by the label filter do not count. */
  protected readonly markedPhotos = computed(() => {
    const names = new Set(this.selected());
    return (this.shownTrip()?.photos ?? []).filter(photo => names.has(photo.name));
  });
  /** Labels that at least one marked photo has, for taking them off again. */
  protected readonly markedLabels = computed(() =>
    [...new Set(this.markedPhotos().flatMap(photo => photo.labels))].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    ),
  );
  /** What is typed into the label field. */
  protected readonly newLabel = signal('');
  /** While a label change is being saved. */
  protected readonly labelling = signal(false);

  protected toggleSelecting(): void {
    this.selecting.update(on => !on);
    this.selected.set([]);
  }

  protected selectAll(): void {
    this.selected.set((this.shownTrip()?.photos ?? []).map(photo => photo.name));
  }

  /** Gives the typed label to the marked photos; the marks stay for another label. */
  protected addLabel(event: Event): void {
    event.preventDefault();
    const label = this.newLabel().trim();
    const photos = this.markedPhotos().map(photo => photo.name);
    if (!label || !photos.length) return;
    this.changeLabel({ label, add: photos }, () => this.newLabel.set(''));
  }

  /** Takes a label off the marked photos that have it. */
  protected removeLabel(label: string): void {
    const photos = this.markedPhotos().filter(photo => photo.labels.includes(label)).map(photo => photo.name);
    this.changeLabel({ label, remove: photos });
  }

  private changeLabel(change: PhotoLabelChange, done?: () => void): void {
    const trip = this.selectedTrip();
    if (!trip || this.labelling()) return;
    this.problems.set([]);
    this.labelling.set(true);
    this.store
      .labelPhotos(trip.id, change)
      .pipe(
        tap({
          next: () => done?.(),
          error: (error: unknown) => this.report(`The label could not be saved: ${this.describe(error)}`, error),
        }),
        catchError(() => EMPTY),
        finalize(() => this.labelling.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

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
