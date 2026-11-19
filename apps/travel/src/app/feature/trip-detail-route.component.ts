import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TravelService } from '@jost/shared';
import { TravelTripDetailComponent } from '@jost/travel/trip-detail';

@Component({
  selector: 'app-trip-detail-route',
  standalone: true,
  imports: [RouterOutlet, TravelTripDetailComponent],
  templateUrl: './trip-detail-route.component.html',
})
export class TripDetailRouteComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly travelService = inject(TravelService);

  readonly trip = this.resolveTrip();

  private resolveTrip() {
    const id = this.route.snapshot.paramMap.get('id') || this.route.snapshot.data['tripId'];
    return id ? this.travelService.getTripById(id) : undefined;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}