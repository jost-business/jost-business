import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@jost/shared';
import { TravelGalleryComponent } from '@jost/travel/gallery';

/**
 * /gallery shows every photo, /gallery?trip=<id> one trip's. The filter lives
 * in the URL, so it survives a reload, can be shared as a link, and the back
 * button steps through the trips that were looked at.
 */
@Component({
  selector: 'app-gallery-route',
  imports: [RouterLink, TravelGalleryComponent],
  styleUrl: './route-actions.scss',
  template: `
    @if (auth.isLoggedIn() && trip(); as trip) {
      <nav class="route-actions" aria-label="Trip actions">
        <a class="action" [routerLink]="['/trip', trip, 'edit']">Edit trip</a>
      </nav>
    }
    <jost-travel-gallery [tripId]="trip()" (tripChange)="select($event)" />
  `,
})
export class GalleryRouteComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  /** The ?trip= query parameter (withComponentInputBinding). */
  readonly trip = input<string>();

  protected select(trip: string | undefined): void {
    this.router.navigate(['/gallery'], { queryParams: trip ? { trip } : {} });
  }
}
