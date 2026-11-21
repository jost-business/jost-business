import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import type { Trip } from '@jost/models';
import { TripsStore } from '@jost/shared';
import { TripEditorComponent } from '@jost/travel/trip-editor';

/** /trips/new creates a trip, /trip/:id/edit edits one. Both need a login (authGuard). */
@Component({
  selector: 'app-trip-editor-route',
  imports: [TripEditorComponent],
  template: `
    @if (!id()) {
      <jost-trip-editor (saved)="open($event)" (cancelled)="back()" />
    } @else if (trip(); as trip) {
      <jost-trip-editor [trip]="trip" (saved)="open($event)" (cancelled)="back()" />
    } @else if (store.isLoading()) {
      <p class="message" aria-busy="true">Loading trip…</p>
    } @else {
      <p class="message">Trip not found.</p>
    }
  `,
  styles: `.message { max-width: 640px; margin: 2rem auto; padding: 0 1rem; }`,
})
export class TripEditorRouteComponent {
  private readonly router = inject(Router);
  protected readonly store = inject(TripsStore);

  /** From /trip/:id/edit; absent on /trips/new. */
  readonly id = input<string>();

  // While the trips load there is no trip yet; the editor must not start
  // out as an empty "new trip" form in the meantime
  protected readonly trip = computed(() => {
    const id = this.id();
    return id ? this.store.tripById(id) : undefined;
  });

  /** After saving, the trip is shown in the gallery, like a click on it in the dashboard. */
  protected open(trip: Trip): void {
    this.router.navigate(['/gallery'], { queryParams: { trip: trip.id } });
  }

  protected back(): void {
    const id = this.id();
    if (id) this.router.navigate(['/gallery'], { queryParams: { trip: id } });
    else this.router.navigate(['/dashboard']);
  }
}
