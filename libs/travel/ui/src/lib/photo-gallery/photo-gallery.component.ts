import { Component, input, linkedSignal, computed, model, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { type CdkDragDrop, CdkDrag, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import type { Photo, Trip } from '@jost/models';

@Component({
  selector: 'jost-photo-gallery',
  imports: [NgOptimizedImage, CdkDropList, CdkDrag, CdkDragPlaceholder],
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
  /** Lets the photos be dragged into a new order (for a logged-in user). */
  readonly sortable = input(false);
  /** The photos in their new order after a drag; saving it is up to the page. */
  readonly reordered = output<Photo[]>();
  /**
   * Selection mode: a click marks a photo instead of opening it, a shift-click
   * marks every photo from the last clicked one. Dragging and deleting are off.
   */
  readonly selecting = input(false);
  /** Names of the marked photos; the page reads and clears it. */
  readonly selected = model<string[]>([]);

  protected readonly selectedNames = computed(() => new Set(this.selected()));
  /** Where a shift-click range starts. */
  private rangeStart = 0;

  protected tileClicked(index: number, event: MouseEvent): void {
    if (!this.selecting()) {
      this.openPhoto(index);
      return;
    }
    const photos = this.trip().photos;
    const name = photos[index].name;
    if (event.shiftKey) {
      const [from, to] = [Math.min(this.rangeStart, index), Math.max(this.rangeStart, index)];
      const range = photos.slice(from, to + 1).map(photo => photo.name);
      this.selected.update(selected => [...new Set([...selected, ...range])]);
    } else {
      this.selected.update(selected => (selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name]));
    }
    this.rangeStart = index;
  }

  dropped(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const photos = [...this.trip().photos];
    moveItemInArray(photos, event.previousIndex, event.currentIndex);
    this.reordered.emit(photos);
  }

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
