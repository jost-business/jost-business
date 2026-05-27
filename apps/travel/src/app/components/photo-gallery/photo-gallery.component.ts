import { Component, Input, signal, HostListener, computed } from '@angular/core';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
})
export class PhotoGalleryComponent {
  @Input({ required: true }) trip!: Trip;

  selectedIndex = signal<number | null>(null);

  selectedPhoto = computed(() => {
    const i = this.selectedIndex();
    return i !== null ? this.photoUrls[i] : null;
  });

  get photoUrls(): string[] {
    return this.trip.photos.map(p => `assets/images/trips/${this.trip.id}/${p}`);
  }

  openPhoto(index: number): void {
    this.selectedIndex.set(index);
  }

  closePhoto(): void {
    this.selectedIndex.set(null);
  }

  prev(): void {
    const i = this.selectedIndex();
    if (i === null) return;
    this.selectedIndex.set((i - 1 + this.photoUrls.length) % this.photoUrls.length);
  }

  next(): void {
    const i = this.selectedIndex();
    if (i === null) return;
    this.selectedIndex.set((i + 1) % this.photoUrls.length);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closePhoto(); }

  @HostListener('document:keydown.arrowRight')
  onArrowRight(): void { if (this.selectedIndex() !== null) this.next(); }

  @HostListener('document:keydown.arrowLeft')
  onArrowLeft(): void { if (this.selectedIndex() !== null) this.prev(); }
}
