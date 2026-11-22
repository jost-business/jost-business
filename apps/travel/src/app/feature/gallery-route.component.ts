import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '@jost/shared';
import { TravelGalleryComponent } from '@jost/travel/gallery';

/**
 * /gallery shows every photo, /gallery?trip=<id> one trip's, and
 * &label=<label> only that trip's photos with a label. The filters live in
 * the URL, so they survive a reload, can be shared as a link, and the back
 * button steps through what was looked at.
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
    <jost-travel-gallery [tripId]="trip()" [label]="label()" [editable]="auth.isLoggedIn()"
                         (tripChange)="select($event)" (labelChange)="selectLabel($event)" />
  `,
})
export class GalleryRouteComponent {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthStore);

  /** The ?trip= query parameter (withComponentInputBinding). */
  readonly trip = input<string>();
  /** The ?label= query parameter: only the trip's photos with this label. */
  readonly label = input<string>();

  /** Another trip; its photos have other labels, so the label filter goes. */
  protected select(trip: string | undefined): void {
    this.router.navigate(['/gallery'], { queryParams: trip ? { trip } : {} });
  }

  protected selectLabel(label: string | undefined): void {
    this.router.navigate(['/gallery'], { queryParams: { trip: this.trip(), label } });
  }
}
