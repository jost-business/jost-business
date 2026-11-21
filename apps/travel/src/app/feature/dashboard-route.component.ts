import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@jost/shared';
import { TravelDashboardComponent } from '@jost/travel/dashboard';

@Component({
  selector: 'app-dashboard-route',
  imports: [TravelDashboardComponent, RouterLink],
  templateUrl: './dashboard-route.component.html',
  styleUrl: './route-actions.scss',
})
export class DashboardRouteComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  /** A trip opens in the gallery, with its filter already set. */
  openTrip(tripId: string): void {
    this.router.navigate(['/gallery'], { queryParams: { trip: tripId } });
  }
}
