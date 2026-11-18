import { Component, input, computed, inject, signal } from '@angular/core';
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
  // Bumped when the countdown reaches zero, so inProgress is re-evaluated
  private readonly arrivedAt = signal(0);

  readonly trip = input<Trip>();
  readonly inProgress = computed(() => {
    this.arrivedAt();
    const trip = this.trip();
    return !!trip && this.travelService.isInProgress(trip);
  });

  onCountdownArrived(): void {
    this.arrivedAt.set(Date.now());
  }
}
