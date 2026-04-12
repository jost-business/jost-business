import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TravelService, Trip } from '@jost/shared';
import { TripDetailCardComponent } from '../components/trip-detail-card/trip-detail-card.component';
import { PhotoGalleryComponent } from '../components/photo-gallery/photo-gallery.component';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [RouterModule, TripDetailCardComponent, PhotoGalleryComponent],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss',
})
export class TravelDetailComponent {
  private route = inject(ActivatedRoute);
  private travelService = inject(TravelService);

  trip: Trip | undefined;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') || this.route.snapshot.data['tripId'];
    if (id) {
      this.trip = this.travelService.getTripById(id);
    }
  }
}