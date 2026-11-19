import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Trip } from '@jost/shared';

@Component({
  selector: 'jost-trip-detail-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './trip-detail-card.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './trip-detail-card.component.scss',
})
export class TripDetailCardComponent {
  @Input({ required: true }) trip!: Trip;

  get duration(): number {
    const diffMs = this.trip.to.getTime() - this.trip.from.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
