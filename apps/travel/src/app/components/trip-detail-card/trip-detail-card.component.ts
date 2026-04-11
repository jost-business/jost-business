import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-trip-detail-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-detail-card.component.html',
  styleUrl: './trip-detail-card.component.scss',
})
export class TripDetailCardComponent {
  @Input({ required: true }) trip!: Trip;

  get duration(): number {
    const diffMs = this.trip.to.getTime() - this.trip.from.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  get photoUrls(): string[] {
    return this.trip.photos.map(p => `assets/images/trips/${this.trip.id}/${p}`);
  }
}
