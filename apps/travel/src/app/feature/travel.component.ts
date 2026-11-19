import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelService } from '@jost/shared';
import { AdventureCountdownComponent } from '../components/adventure-countdown/adventure-countdown.component';

@Component({
  selector: 'app-travel-list',
  imports: [DatePipe, RouterModule, AdventureCountdownComponent],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
export class TravelListComponent {
  protected readonly travelService = inject(TravelService);
}
