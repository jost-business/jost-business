import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
})
export class PhotoGalleryComponent {
  @Input({ required: true }) trip!: Trip;

  get photoUrls(): string[] {
    return this.trip.photos.map(p => `assets/images/trips/${this.trip.id}/${p}`);
  }
}
