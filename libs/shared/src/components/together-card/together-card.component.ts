import { Component, input, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TravelService } from '../../services/travel.service';
import { Trip } from '../../models/travel.model';

/** Shown instead of the countdown while a trip is in progress. */
@Component({
  selector: 'lib-together-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './together-card.component.html',
  styleUrl: './together-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogetherCardComponent {
  private readonly travelService = inject(TravelService);

  readonly trip = input.required<Trip>();
  readonly version = input<string>('');

  readonly progress = computed(() => this.travelService.getTripProgress(this.trip()));
  readonly city = computed(() => this.travelService.getCity(this.trip()));
  readonly country = computed(() => this.travelService.getCountry(this.trip()));
}
