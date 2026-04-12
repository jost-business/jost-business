import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-trip-detail-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './trip-detail-card.component.html',
  styleUrl: './trip-detail-card.component.scss',
})
export class TripDetailCardComponent {
  @Input({ required: true }) trip!: Trip;

  get duration(): number {
    const diffMs = this.trip.to.getTime() - this.trip.from.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
