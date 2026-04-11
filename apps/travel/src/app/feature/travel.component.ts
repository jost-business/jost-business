import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelService } from '@jost/shared';
import { AdventureCountdownComponent } from '../components/adventure-countdown/adventure-countdown.component';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AdventureCountdownComponent],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
export class TravelListComponent {
  constructor(public travelService: TravelService) {}
}
