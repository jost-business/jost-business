import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TravelDashboardComponent } from '@jost/travel/dashboard';

@Component({
  selector: 'app-dashboard-route',
  standalone: true,
  imports: [TravelDashboardComponent],
  templateUrl: './dashboard-route.component.html',
})
export class DashboardRouteComponent {
  private readonly router = inject(Router);

  openTrip(tripId: string): void {
    this.router.navigate(['/trip', tripId]);
  }
}