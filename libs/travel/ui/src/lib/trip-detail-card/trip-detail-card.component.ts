import { Component, input, computed } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Trip } from '@jost/models';

/** The head of a trip's page: its name, dates and length on its first photo. */
@Component({
  selector: 'jost-trip-detail-card',
  imports: [DatePipe, NgOptimizedImage],
  templateUrl: './trip-detail-card.component.html',
  styleUrl: './trip-detail-card.component.scss',
})
export class TripDetailCardComponent {
  readonly trip = input.required<Trip>();

  readonly duration = computed(() => {
    const { from, to } = this.trip();
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  });

  /** The first photo, as the banner's backdrop. */
  protected readonly cover = computed(() => this.trip().photos[0]?.url);
}
