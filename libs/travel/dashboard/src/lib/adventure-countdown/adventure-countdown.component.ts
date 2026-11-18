import { Component, input, computed, inject } from '@angular/core';
import { Trip, TravelService } from '@jost/shared';
import { RomanticCountdownComponent, TogetherCardComponent } from '@jost/shared';

@Component({
  selector: 'app-adventure-countdown',
  standalone: true,
  imports: [RomanticCountdownComponent, TogetherCardComponent],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent {
  private readonly travelService = inject(TravelService);

  readonly trip = input<Trip>();
  readonly inProgress = computed(() => {
    const trip = this.trip();
    return !!trip && this.travelService.isInProgress(trip);
  });
}
