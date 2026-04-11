import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TravelService, Trip } from '@jost/shared';
import { TripDetailCardComponent } from '../../components/trip-detail-card/trip-detail-card.component';

@Component({
  selector: 'app-turkey-2025',
  standalone: true,
  imports: [CommonModule, TripDetailCardComponent],
  templateUrl: './2025-10-turkey.component.html',
  styleUrl: './2025-10-turkey.component.scss',
})
export class Turkey2025Component {
  private route = inject(ActivatedRoute);
  private travelService = inject(TravelService);

  trip: Trip | undefined;

  constructor() {
    const id = this.route.parent?.snapshot.paramMap.get('id') || this.route.parent?.snapshot.data['tripId'];
    if (id) {
      this.trip = this.travelService.getTripById(id);
    }
  }
}
