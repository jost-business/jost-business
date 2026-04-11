import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TravelService } from '@jost/shared';

@Component({
  selector: 'app-travel-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './travel.component.html',
  styleUrl: './travel.component.scss',
})
export class TravelListComponent {
  constructor(public travelService: TravelService) {}
}
