import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TravelService } from '@jost/shared';
import { TravelTripDetailComponent } from '@jost/travel/trip-detail';

@Component({
  selector: 'app-trip-detail-route',
  imports: [RouterOutlet, TravelTripDetailComponent],
  templateUrl: './trip-detail-route.component.html',
})
export class TripDetailRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly travelService = inject(TravelService);

  private readonly tripId: string | undefined =
    this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.data['tripId'];

  // A computed, because the trips arrive from the API after this component is created
  readonly trip = computed(() => (this.tripId ? this.travelService.getTripById(this.tripId) : undefined));

  goBack(): void {
    this.router.navigate(['/']);
  }
}
