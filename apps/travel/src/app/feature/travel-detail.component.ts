import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TravelService } from '@jost/shared';
import { Trip } from '@jost/shared';

@Component({
  selector: 'app-travel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './travel-detail.component.html',
  styleUrl: './travel-detail.component.scss',
})
export class TravelDetailComponent {
  private route = inject(ActivatedRoute);
  private travelService = inject(TravelService);

  trip: Trip | undefined;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.trip = this.travelService.getTripById(id);
    }
  }

  get duration(): number {
    if (!this.trip) return 0;
    const diffMs = this.trip.to.getTime() - this.trip.from.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}
