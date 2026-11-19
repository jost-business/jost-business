import { Component, input, computed, inject } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Clock } from '../../services/clock';
import { tripCity, tripCountry, tripProgress } from '../../utils/trip';
import { Trip } from '../../models/travel.model';

/** Shown instead of the countdown while a trip is in progress. */
@Component({
  selector: 'lib-together-card',
  imports: [DatePipe, NgOptimizedImage],
  templateUrl: './together-card.component.html',
  styleUrl: './together-card.component.scss',
})
export class TogetherCardComponent {
  private readonly clock = inject(Clock);

  readonly trip = input.required<Trip>();
  readonly version = input<string>('');

  readonly progress = computed(() => tripProgress(this.trip(), this.clock.now()));
  readonly city = computed(() => tripCity(this.trip()));
  readonly country = computed(() => tripCountry(this.trip()));
}
