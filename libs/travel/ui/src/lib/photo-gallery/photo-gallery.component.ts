import { Component, input, linkedSignal, computed, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import type { Photo, Trip } from '@jost/models';

@Component({
  selector: 'jost-photo-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
  host: {
    '(document:keydown.escape)': 'closePhoto()',
    '(document:keydown.arrowRight)': 'onArrowRight()',
    '(document:keydown.arrowLeft)': 'onArrowLeft()',
  },
})
export class PhotoGalleryComponent {
  readonly trip = input.required<Trip>();
  /** The heading above the photos. */
  readonly heading = input('Photos');
  /** Shows a delete button on every photo (for a logged-in user). */
  readonly deletable = input(false);
  /** The delete button of a photo was clicked; deleting is up to the page. */
  readonly deleteRequested = output<Photo>();

  /**
   * The photo open in the lightbox. Writable like a signal, but linked to the
   * trip: when another trip is shown it resets to closed, so an index from
   * the previous trip never points into the new trip's photos.
   *
   * The source is the id rather than the trip itself: reloading the trips
   * creates new objects for the same trip, which should not close the photo.
   */
  readonly selectedIndex = linkedSignal<string, number | null>({
    source: () => this.trip().id,
    computation: () => null,
  });

  readonly photoUrls = computed(() => this.trip().photos.map(photo => photo.url));

  readonly selectedPhoto = computed(() => {
    const i = this.selectedIndex();
    return i !== null ? this.photoUrls()[i] : null;
  });

  openPhoto(index: number): void {
    this.selectedIndex.set(index);
  }

  closePhoto(): void {
    this.selectedIndex.set(null);
  }

  prev(): void {
    const i = this.selectedIndex();
    if (i === null) return;
    this.selectedIndex.set((i - 1 + this.photoUrls().length) % this.photoUrls().length);
  }

  next(): void {
    const i = this.selectedIndex();
    if (i === null) return;
    this.selectedIndex.set((i + 1) % this.photoUrls().length);
  }

  onArrowRight(): void { if (this.selectedIndex() !== null) this.next(); }

  onArrowLeft(): void { if (this.selectedIndex() !== null) this.prev(); }
}
