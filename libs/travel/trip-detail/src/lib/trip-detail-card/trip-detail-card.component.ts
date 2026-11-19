import { Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Trip } from '@jost/shared';

@Component({
  selector: 'jost-trip-detail-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './trip-detail-card.component.html',
  styleUrl: './trip-detail-card.component.scss',
})
export class TripDetailCardComponent {
  readonly trip = input.required<Trip>();

  readonly duration = computed(() => {
    const { from, to } = this.trip();
    return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  });
}
