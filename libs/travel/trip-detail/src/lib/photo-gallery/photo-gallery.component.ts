import { Component, input, signal, computed } from '@angular/core';
import { Trip } from '@jost/shared';

@Component({
  selector: 'jost-photo-gallery',
  standalone: true,
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

  readonly selectedIndex = signal<number | null>(null);

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
