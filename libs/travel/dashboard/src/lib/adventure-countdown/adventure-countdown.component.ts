import { Component, input, computed, inject } from '@angular/core';
import { Trip } from '@jost/models';
import { TripsStore, isTripInProgress } from '@jost/shared';
import { RomanticCountdownComponent, TogetherCardComponent } from '@jost/shared';

@Component({
  selector: 'app-adventure-countdown',
  imports: [RomanticCountdownComponent, TogetherCardComponent],
  templateUrl: './adventure-countdown.component.html',
  styleUrl: './adventure-countdown.component.scss',
})
export class AdventureCountdownComponent {
  private readonly store = inject(TripsStore);

  readonly trip = input<Trip>();
  // Reads the clock signal through the store, so this flips by itself when the trip starts
  readonly inProgress = computed(() => {
    const trip = this.trip();
    return !!trip && isTripInProgress(trip, this.store.now());
  });
}
