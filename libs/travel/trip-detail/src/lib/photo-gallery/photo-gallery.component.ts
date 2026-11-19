import { Component, input, linkedSignal, computed } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Trip } from '@jost/shared';

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

  readonly photoUrls = computed(() => {
    const trip = this.trip();
    return trip.photos.map(p => `assets/images/trips/${trip.id}/${p}`);
  });

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
