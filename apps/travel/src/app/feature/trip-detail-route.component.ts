import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TripsStore } from '@jost/shared';
import { TravelTripDetailComponent } from '@jost/travel/trip-detail';

@Component({
  selector: 'app-trip-detail-route',
  imports: [RouterOutlet, TravelTripDetailComponent],
  templateUrl: './trip-detail-route.component.html',
})
export class TripDetailRouteComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(TripsStore);

  /**
   * Filled by the router (withComponentInputBinding) from the :id parameter
   * or the route's static data. It is a signal, so when the router reuses
   * this component for /trip/a → /trip/b the page follows along; a value read
   * once from route.snapshot would keep showing the first trip.
   */
  readonly id = input.required<string>();

  // The trips may still be loading when the page opens; tripById reads the
  // store's signal, so the trip appears as soon as they arrive
  readonly trip = computed(() => this.store.tripById(this.id()));

  goBack(): void {
    this.router.navigate(['/']);
  }
}
