import { Component, input, output } from '@angular/core';
import { Trip } from '@jost/shared';
import { TripDetailCardComponent } from './trip-detail-card/trip-detail-card.component';
import { PhotoGalleryComponent } from './photo-gallery/photo-gallery.component';

@Component({
  selector: 'jost-travel-trip-detail',
  standalone: true,
  imports: [TripDetailCardComponent, PhotoGalleryComponent],
  templateUrl: './travel-trip-detail.component.html',
  styleUrl: './travel-trip-detail.component.scss',
})
export class TravelTripDetailComponent {
  readonly trip = input<Trip | undefined>();
  readonly backRequested = output<void>();
}