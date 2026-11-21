import { Component, input, output } from '@angular/core';
import { Trip } from '@jost/models';
import { PhotoGalleryComponent, TripDetailCardComponent } from '@jost/travel/ui';

@Component({
  selector: 'jost-travel-trip-detail',
  imports: [TripDetailCardComponent, PhotoGalleryComponent],
  templateUrl: './travel-trip-detail.component.html',
  styleUrl: './travel-trip-detail.component.scss',
})
export class TravelTripDetailComponent {
  readonly trip = input<Trip | undefined>();
  readonly backRequested = output<void>();
}